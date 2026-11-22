import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Draw } from './Draw';
import { PrizeTier } from './PrizeTier';
import { bigintTransformer } from '../utils/transformers';

@Entity('prize_pools')
export class PrizePool {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'draw_id', type: 'uuid', unique: true })
  drawId!: string;

  @OneToOne(() => Draw, (draw) => draw.prizePool, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'draw_id' })
  draw!: Draw;

  @Column({
    name: 'total_pool_cents',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  totalPoolCents!: number;

  @Column({
    name: 'rollover_in_cents',
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  rolloverInCents!: number;

  @Column({
    name: 'rollover_out_cents',
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  rolloverOutCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'is_finalized', type: 'boolean', default: false })
  isFinalized!: boolean;

  @OneToMany(() => PrizeTier, (tier) => tier.prizePool, { cascade: true })
  tiers?: PrizeTier[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
