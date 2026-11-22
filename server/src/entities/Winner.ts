import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { VerificationStatus } from '../constants';
import { Draw } from './Draw';
import { DrawEntry } from './DrawEntry';
import { PrizeTier } from './PrizeTier';
import { User } from './User';
import { WinnerProof } from './WinnerProof';
import { Payout } from './Payout';
import { bigintTransformer } from '../utils/transformers';

@Entity('winners')
export class Winner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'draw_id', type: 'uuid' })
  drawId!: string;

  @ManyToOne(() => Draw, (draw) => draw.winners, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'draw_id' })
  draw!: Draw;

  @Index({ unique: true })
  @Column({ name: 'draw_entry_id', type: 'uuid', unique: true })
  drawEntryId!: string;

  @OneToOne(() => DrawEntry, (entry) => entry.winner, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'draw_entry_id' })
  entry!: DrawEntry;

  @Index()
  @Column({ name: 'prize_tier_id', type: 'uuid' })
  prizeTierId!: string;

  @ManyToOne(() => PrizeTier, (tier) => tier.winners, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'prize_tier_id' })
  prizeTier!: PrizeTier;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.winnings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    name: 'prize_amount_cents',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  prizeAmountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Index()
  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus!: VerificationStatus;

  @Column({ name: 'verified_by_user_id', type: 'uuid', nullable: true })
  verifiedByUserId!: string | null;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'verified_by_user_id' })
  verifiedBy?: User | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason!: string | null;

  @OneToMany(() => WinnerProof, (proof) => proof.winner, { cascade: true })
  proofs?: WinnerProof[];

  @OneToOne(() => Payout, (payout) => payout.winner)
  payout?: Payout;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
