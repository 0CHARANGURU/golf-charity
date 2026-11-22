import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PayoutStatus } from '../constants';
import { Winner } from './Winner';
import { User } from './User';
import { bigintTransformer } from '../utils/transformers';

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'winner_id', type: 'uuid', unique: true })
  winnerId!: string;

  @OneToOne(() => Winner, (winner) => winner.payout, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'winner_id' })
  winner!: Winner;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    name: 'amount_cents',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  amountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'payout_method', type: 'varchar', length: 50, default: 'STRIPE_CONNECT' })
  payoutMethod!: string;

  @Index({ unique: true, where: 'payout_reference IS NOT NULL' })
  @Column({ name: 'payout_reference', type: 'varchar', length: 255, nullable: true, unique: true })
  payoutReference!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status!: PayoutStatus;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason!: string | null;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
