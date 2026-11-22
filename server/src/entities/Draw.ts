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
import { DrawStatus } from '../constants';
import { DrawConfiguration } from './DrawConfiguration';
import { DrawResult } from './DrawResult';
import { PrizePool } from './PrizePool';
import { DrawEntry } from './DrawEntry';
import { Winner } from './Winner';

@Entity('draws')
export class Draw {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'draw_configuration_id', type: 'uuid' })
  drawConfigurationId!: string;

  @ManyToOne(() => DrawConfiguration, (config) => config.draws, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'draw_configuration_id' })
  configuration!: DrawConfiguration;

  @Index({ unique: true })
  @Column({ name: 'draw_number', type: 'integer', unique: true })
  drawNumber!: number;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Index()
  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt!: Date;

  @Column({ name: 'executed_at', type: 'timestamptz', nullable: true })
  executedAt!: Date | null;

  @Index()
  @Column({
    type: 'enum',
    enum: DrawStatus,
    default: DrawStatus.SCHEDULED,
  })
  status!: DrawStatus;

  @Column({ name: 'total_entries_count', type: 'integer', default: 0 })
  totalEntriesCount!: number;

  @OneToOne(() => DrawResult, (result) => result.draw, { cascade: true })
  result?: DrawResult;

  @OneToOne(() => PrizePool, (pool) => pool.draw, { cascade: true })
  prizePool?: PrizePool;

  @OneToMany(() => DrawEntry, (entry) => entry.draw)
  entries?: DrawEntry[];

  @OneToMany(() => Winner, (winner) => winner.draw)
  winners?: Winner[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
