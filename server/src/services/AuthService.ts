import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../database/dataSource';
import { User, UserProfile, RefreshToken, AuditLog } from '../entities';
import { UserRole, UserStatus } from '../constants';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  TokenPayload,
} from '../utils/jwt';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export class AuthService {
  private userRepo = AppDataSource.getRepository(User);
  private profileRepo = AppDataSource.getRepository(UserProfile);
  private tokenRepo = AppDataSource.getRepository(RefreshToken);
  private auditRepo = AppDataSource.getRepository(AuditLog);

  async register(input: RegisterInput): Promise<AuthTokens> {
    const normalizedEmail = input.email.trim().toLowerCase();

    const existing = await this.userRepo.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = this.userRepo.create({
      email: normalizedEmail,
      passwordHash,
      role: UserRole.SUBSCRIBER,
      status: UserStatus.ACTIVE,
      isEmailVerified: false,
      verificationToken,
    });

    await this.userRepo.save(user);

    const profile = this.profileRepo.create({
      userId: user.id,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      country: input.country || 'US',
    });
    await this.profileRepo.save(profile);
    user.profile = profile;

    // Issue tokens
    return this.createSession(user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: { email: normalizedEmail },
      relations: ['profile'],
    });

    if (!user) {
      throw new Error('Invalid email or password credentials.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error(`Your account is currently ${user.status.toLowerCase()}. Please contact support.`);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password credentials.');
    }

    return this.createSession(user);
  }

  async refreshToken(oldRefreshToken: string): Promise<AuthTokens> {
    let payload: TokenPayload & { familyId: string };
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new Error('Invalid or expired refresh token.');
    }

    const hashed = hashToken(oldRefreshToken);
    const tokenRecord = await this.tokenRepo.findOne({
      where: { tokenHash: hashed },
      relations: ['user', 'user.profile'],
    });

    if (!tokenRecord) {
      throw new Error('Refresh token not found.');
    }

    // Token Reuse / Theft Detection
    if (tokenRecord.isRevoked) {
      // Invalidate all tokens in this family immediately!
      await this.tokenRepo.update(
        { familyId: tokenRecord.familyId },
        { isRevoked: true }
      );

      await this.auditRepo.save(
        this.auditRepo.create({
          actorUserId: tokenRecord.userId,
          action: 'SECURITY_TOKEN_REUSE_DETECTED',
          entityType: 'RefreshToken',
          entityId: tokenRecord.id,
          details: {
            familyId: tokenRecord.familyId,
            warning: 'Revoked refresh token presented; invalidated entire token family.',
          },
        })
      );

      throw new Error('Security alert: Refresh token has already been used. Please log in again.');
    }

    // Revoke old token
    tokenRecord.isRevoked = true;
    await this.tokenRepo.save(tokenRecord);

    const user = tokenRecord.user;
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is not active.');
    }

    // Generate new token pair under the same family
    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload, tokenRecord.familyId);
    const newHashed = hashToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newTokenRecord = this.tokenRepo.create({
      userId: user.id,
      tokenHash: newHashed,
      familyId: tokenRecord.familyId,
      expiresAt,
      isRevoked: false,
    });
    await this.tokenRepo.save(newTokenRecord);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<boolean> {
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await this.tokenRepo.update({ tokenHash: hashed }, { isRevoked: true });
    } else {
      await this.tokenRepo.update({ userId }, { isRevoked: true });
    }
    return true;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      // Return true to avoid user enumeration
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpiresAt = expiresAt;
    await this.userRepo.save(user);

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { passwordResetToken: token },
    });

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new Error('Invalid or expired password reset token.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await this.userRepo.save(user);

    // Invalidate existing sessions
    await this.tokenRepo.update({ userId: user.id }, { isRevoked: true });
    return true;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { verificationToken: token } });
    if (!user) {
      throw new Error('Invalid verification token.');
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await this.userRepo.save(user);
    return true;
  }

  private async createSession(user: User): Promise<AuthTokens> {
    const familyId = crypto.randomUUID();
    const tokenPayload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload, familyId);
    const hashed = hashToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const record = this.tokenRepo.create({
      userId: user.id,
      tokenHash: hashed,
      familyId,
      expiresAt,
      isRevoked: false,
    });
    await this.tokenRepo.save(record);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
