import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { PlanInterval } from '../constants';
import { Subscription } from './Subscription';
import { bigintTransformer } from '../utils/transformers';

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'stripe_price_id', type: 'varchar', length: 255, unique: true })
  stripePriceId!: string;

  @Column({ name: 'stripe_product_id', type: 'varchar', length: 255 })
  stripeProductId!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  slug!: string;

  @Column({
    type: 'enum',
    enum: PlanInterval,
    default: PlanInterval.MONTH,
  })
  interval!: PlanInterval;

  @Column({
    name: 'amount_cents',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  amountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'entries_per_draw', type: 'integer', default: 1 })
  entriesPerDraw!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Subscription, (sub) => sub.plan)
  subscriptions?: Subscription[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
