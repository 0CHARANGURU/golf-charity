import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '../constants';

export interface TokenPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as any,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
}

export function signRefreshToken(payload: TokenPayload, familyId: string): string {
  return jwt.sign({ ...payload, familyId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as any,
  });
}

export function verifyRefreshToken(token: string): TokenPayload & { familyId: string } {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload & { familyId: string };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
