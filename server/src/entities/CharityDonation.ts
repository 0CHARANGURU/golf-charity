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
import { Charity } from './Charity';
import { User } from './User';
import { Payment } from './Payment';
import { bigintTransformer } from '../utils/transformers';

@Entity('charity_donations')
@Check(`"amount_cents" > 0`)
export class CharityDonation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'charity_id', type: 'uuid' })
  charityId!: string;

  @ManyToOne(() => Charity, (charity) => charity.donations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charity_id' })
  charity!: Charity;

  @Index()
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @Index()
  @Column({ name: 'payment_id', type: 'uuid', nullable: true })
  paymentId!: string | null;

  @ManyToOne(() => Payment, (payment) => payment.charityDonations, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment | null;

  @Column({
    name: 'amount_cents',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  amountCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ name: 'source_type', type: 'varchar', length: 32, default: 'SUBSCRIPTION_PERCENTAGE' })
  sourceType!: string;

  @Index()
  @Column({ type: 'varchar', length: 32, default: 'ACCRUED' })
  status!: string;

  @Column({ name: 'disbursed_at', type: 'timestamptz', nullable: true })
  disbursedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
