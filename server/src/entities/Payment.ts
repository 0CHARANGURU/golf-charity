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
import { PaymentStatus } from '../constants';
import { User } from './User';
import { Subscription } from './Subscription';
import { CharityDonation } from './CharityDonation';
import { bigintTransformer } from '../utils/transformers';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'subscription_id', type: 'uuid', nullable: true })
  subscriptionId!: string | null;

  @ManyToOne(() => Subscription, (sub) => sub.payments, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription?: Subscription | null;

  @Index({ unique: true, where: 'stripe_payment_intent_id IS NOT NULL' })
  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', length: 255, nullable: true, unique: true })
  stripePaymentIntentId!: string | null;

  @Index({ unique: true, where: 'stripe_invoice_id IS NOT NULL' })
  @Column({ name: 'stripe_invoice_id', type: 'varchar', length: 255, nullable: true, unique: true })
  stripeInvoiceId!: string | null;

  @Column({
    name: 'amount_cents',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  amountCents!: number;

  @Column({
    name: 'fee_cents',
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  feeCents!: number;

  @Column({
    name: 'net_cents',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  netCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ name: 'payment_method_type', type: 'varchar', length: 50, default: 'card' })
  paymentMethodType!: string;

  @Column({ name: 'receipt_url', type: 'text', nullable: true })
  receiptUrl!: string | null;

  @Index({ unique: true })
  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, unique: true })
  idempotencyKey!: string;

  @OneToMany(() => CharityDonation, (donation) => donation.payment)
  charityDonations?: CharityDonation[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
