import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { DrawConfiguration } from './DrawConfiguration';
import { User } from './User';

@Entity('draw_simulations')
export class DrawSimulation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'draw_configuration_id', type: 'uuid' })
  drawConfigurationId!: string;

  @ManyToOne(() => DrawConfiguration, (config) => config.simulations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'draw_configuration_id' })
  configuration!: DrawConfiguration;

  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Index()
  @Column({ name: 'simulated_by_user_id', type: 'uuid' })
  simulatedByUserId!: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'simulated_by_user_id' })
  simulatedBy!: User;

  @Column({ name: 'simulated_entry_count', type: 'integer' })
  simulatedEntryCount!: number;

  @Column({ name: 'winning_numbers', type: 'integer', array: true })
  winningNumbers!: number[];

  @Column({ name: 'simulation_stats', type: 'jsonb' })
  simulationStats!: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
