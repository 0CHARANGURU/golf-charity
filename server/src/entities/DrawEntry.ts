import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Draw } from './Draw';
import { User } from './User';
import { Subscription } from './Subscription';
import { Winner } from './Winner';

@Entity('draw_entries')
export class DrawEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'draw_id', type: 'uuid' })
  drawId!: string;

  @ManyToOne(() => Draw, (draw) => draw.entries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'draw_id' })
  draw!: Draw;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.drawEntries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId!: string;

  @ManyToOne(() => Subscription, (sub) => sub.drawEntries, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: Subscription;

  @Column({ name: 'selected_numbers', type: 'integer', array: true })
  selectedNumbers!: number[];

  @Column({ name: 'matched_numbers', type: 'integer', array: true, nullable: true })
  matchedNumbers!: number[] | null;

  @Index()
  @Column({ name: 'match_count', type: 'integer', default: 0 })
  matchCount!: number;

  @Index()
  @Column({ name: 'is_winner', type: 'boolean', default: false })
  isWinner!: boolean;

  @OneToOne(() => Winner, (winner) => winner.entry)
  winner?: Winner;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
