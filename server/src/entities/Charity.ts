import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { UserCharityPreference } from './UserCharityPreference';
import { CharityDonation } from './CharityDonation';
import { bigintTransformer } from '../utils/transformers';

@Entity('charities')
export class Charity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 220, unique: true })
  slug!: string;

  @Index({ unique: true })
  @Column({ name: 'registration_number', type: 'varchar', length: 100, unique: true })
  registrationNumber!: string;

  @Column({ type: 'text' })
  description!: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl!: string | null;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl!: string | null;

  @Index()
  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ name: 'is_verified', type: 'boolean', default: true })
  isVerified!: boolean;

  @Column({
    name: 'total_received_cents',
    type: 'bigint',
    default: 0,
    transformer: bigintTransformer,
  })
  totalReceivedCents!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @OneToMany(() => UserCharityPreference, (pref) => pref.charity)
  preferences?: UserCharityPreference[];

  @OneToMany(() => CharityDonation, (donation) => donation.charity)
  donations?: CharityDonation[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
