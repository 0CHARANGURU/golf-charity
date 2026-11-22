import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Draw } from './Draw';

@Entity('draw_results')
export class DrawResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'draw_id', type: 'uuid', unique: true })
  drawId!: string;

  @OneToOne(() => Draw, (draw) => draw.result, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'draw_id' })
  draw!: Draw;

  @Column({ name: 'winning_numbers', type: 'integer', array: true })
  winningNumbers!: number[];

  @Column({ name: 'draw_seed_hash', type: 'varchar', length: 255 })
  drawSeedHash!: string;

  @Column({ name: 'algorithm_mode', type: 'varchar', length: 32 })
  algorithmMode!: string;

  @Column({ name: 'published_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  publishedAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
