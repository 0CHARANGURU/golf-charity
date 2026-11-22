import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DrawMode } from '../constants';
import { Draw } from './Draw';
import { DrawSimulation } from './DrawSimulation';
import { decimalTransformer } from '../utils/transformers';

@Entity('draw_configurations')
export class DrawConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({
    name: 'draw_mode',
    type: 'enum',
    enum: DrawMode,
    default: DrawMode.RANDOM,
  })
  drawMode!: DrawMode;

  @Column({ name: 'min_number', type: 'integer', default: 1 })
  minNumber!: number;

  @Column({ name: 'max_number', type: 'integer', default: 45 })
  maxNumber!: number;

  @Column({ name: 'numbers_drawn_count', type: 'integer', default: 5 })
  numbersDrawnCount!: number;

  @Column({
    name: 'prize_distribution_5_match',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 40.00,
    transformer: decimalTransformer,
  })
  prizeDistribution5Match!: number;

  @Column({
    name: 'prize_distribution_4_match',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 35.00,
    transformer: decimalTransformer,
  })
  prizeDistribution4Match!: number;

  @Column({
    name: 'prize_distribution_3_match',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 25.00,
    transformer: decimalTransformer,
  })
  prizeDistribution3Match!: number;

  @Column({ name: 'rollover_unclaimed', type: 'boolean', default: true })
  rolloverUnclaimed!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Draw, (draw) => draw.configuration)
  draws?: Draw[];

  @OneToMany(() => DrawSimulation, (sim) => sim.configuration)
  simulations?: DrawSimulation[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
