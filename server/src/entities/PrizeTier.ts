import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { PrizePool } from './PrizePool';
import { Winner } from './Winner';
import { bigintTransformer, decimalTransformer } from '../utils/transformers';

@Entity('prize_tiers')
@Check(`"match_count" IN (3, 4, 5)`)
export class PrizeTier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'prize_pool_id', type: 'uuid' })
  prizePoolId!: string;

  @ManyToOne(() => PrizePool, (pool) => pool.tiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prize_pool_id' })
  prizePool!: PrizePool;

  @Column({ name: 'match_count', type: 'integer' })
  matchCount!: number;

  @Column({
    name: 'allocated_percentage',
    type: 'numeric',
    precision: 5,
    scale: 2,
    transformer: decimalTransformer,
  })
  allocatedPercentage!: number;

  @Column({
    name: 'allocated_cents',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  allocatedCents!: number;

  @Column({ name: 'winner_count', type: 'integer', default: 0 })
  winnerCount!: number;

  @Column({
    name: 'payout_per_winner_cents',
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  payoutPerWinnerCents!: number;

  @Column({
    name: 'rollover_cents',
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  rolloverCents!: number;

  @OneToMany(() => Winner, (winner) => winner.prizeTier)
  winners?: Winner[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
