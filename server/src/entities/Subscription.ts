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
} from 'typeorm';
import { SubscriptionStatus } from '../constants';
import { User } from './User';
import { SubscriptionPlan } from './SubscriptionPlan';
import { Payment } from './Payment';
import { DrawEntry } from './DrawEntry';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.subscriptions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan!: SubscriptionPlan;

  @Index({ unique: true })
  @Column({ name: 'stripe_subscription_id', type: 'varchar', length: 255, unique: true })
  stripeSubscriptionId!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIALING,
  })
  status!: SubscriptionStatus;

  @Column({ type: 'timestamptz' })
  currentPeriodStart!: Date;

  @Index()
  @Column({ type: 'timestamptz' })
  currentPeriodEnd!: Date;

  @Column({ type: 'boolean', default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt!: Date | null;

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments?: Payment[];

  @OneToMany(() => DrawEntry, (entry) => entry.subscription)
  drawEntries?: DrawEntry[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
