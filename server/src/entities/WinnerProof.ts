import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Winner } from './Winner';
import { bigintTransformer } from '../utils/transformers';

@Entity('winner_proofs')
export class WinnerProof {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'winner_id', type: 'uuid' })
  winnerId!: string;

  @ManyToOne(() => Winner, (winner) => winner.proofs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'winner_id' })
  winner!: Winner;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl!: string;

  @Column({ name: 'file_type', type: 'varchar', length: 50 })
  fileType!: string;

  @Column({
    name: 'file_size_bytes',
    type: 'bigint',
    transformer: bigintTransformer,
  })
  fileSizeBytes!: number;

  @Column({ name: 'submitted_notes', type: 'text', nullable: true })
  submittedNotes!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
