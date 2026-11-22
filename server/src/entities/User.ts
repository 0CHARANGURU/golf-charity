import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { UserRole, UserStatus } from '../constants';
import { UserProfile } from './UserProfile';
import { RefreshToken } from './RefreshToken';
import { Subscription } from './Subscription';
import { Payment } from './Payment';
import { GolfScore } from './GolfScore';
import { UserCharityPreference } from './UserCharityPreference';
import { DrawEntry } from './DrawEntry';
import { Winner } from './Winner';
import { Notification } from './Notification';
import { AuditLog } from './AuditLog';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SUBSCRIBER,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationToken!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  passwordResetExpiresAt!: Date | null;

  @Index({ unique: true, where: 'stripe_customer_id IS NOT NULL' })
  @Column({ name: 'stripe_customer_id', type: 'varchar', length: 255, nullable: true, unique: true })
  stripeCustomerId!: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  profile?: UserProfile;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens?: RefreshToken[];

  @OneToMany(() => Subscription, (sub) => sub.user)
  subscriptions?: Subscription[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments?: Payment[];

  @OneToMany(() => GolfScore, (score) => score.user)
  golfScores?: GolfScore[];

  @OneToMany(() => UserCharityPreference, (pref) => pref.user)
  charityPreferences?: UserCharityPreference[];

  @OneToMany(() => DrawEntry, (entry) => entry.user)
  drawEntries?: DrawEntry[];

  @OneToMany(() => Winner, (winner) => winner.user)
  winnings?: Winner[];

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications?: Notification[];

  @OneToMany(() => AuditLog, (log) => log.actor)
  auditLogs?: AuditLog[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
