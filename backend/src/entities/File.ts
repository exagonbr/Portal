    import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Book } from './Book';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  original_name: string;

  @Column({ type: 'varchar', length: 10 })
  type: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ type: 'varchar', length: 20 })
  size_formatted: string;

  @Column({ type: 'varchar', length: 100 })
  bucket: string;

  @Column({ type: 'varchar', length: 500, unique: true })
  s3_key: string;

  @Column({ type: 'text' })
  s3_url: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['literario', 'professor', 'aluno'] })
  category: 'literario' | 'professor' | 'aluno';

  @Column({ type: 'jsonb', default: '{}' })
  metadata: any;

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum: string;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'uuid', nullable: true })
  linked_book_id: string;

  @ManyToOne(() => Book, { nullable: true })
  @JoinColumn({ name: 'linked_book_id' })
  linkedBook: Book;

  @Column({ type: 'timestamp', nullable: true })
  linked_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
