import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { User } from './User';

@Entity('golf_scores')
@Check(`"score_value" >= 1 AND "score_value" <= 45`)
@Check(`"holes_played" IN (9, 18)`)
export class GolfScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.golfScores, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'score_value', type: 'integer' })
  scoreValue!: number;

  @Column({ name: 'played_at', type: 'date' })
  playedAt!: string;

  @Column({ name: 'course_name', type: 'varchar', length: 150 })
  courseName!: string;

  @Column({ name: 'holes_played', type: 'integer', default: 18 })
  holesPlayed!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'archived_at', type: 'timestamptz', nullable: true })
  archivedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
