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
import { Charity } from './Charity';
import { decimalTransformer } from '../utils/transformers';

@Entity('user_charity_preferences')
@Check(`"percentage" >= 10.00 AND "percentage" <= 100.00`)
export class UserCharityPreference {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.charityPreferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'charity_id', type: 'uuid' })
  charityId!: string;

  @ManyToOne(() => Charity, (charity) => charity.preferences, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charity_id' })
  charity!: Charity;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 10.00,
    transformer: decimalTransformer,
  })
  percentage!: number;

  @Column({ name: 'is_primary', type: 'boolean', default: true })
  isPrimary!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
