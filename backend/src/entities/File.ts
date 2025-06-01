import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  original_name: string;

  @Column()
  type: string;

  @Column({ type: 'bigint' })
  size: number;

  @Column({ nullable: true })
  size_formatted?: string;

  @Column()
  bucket: string;

  @Column({ unique: true })
  s3_key: string;

  @Column()
  s3_url: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['literario', 'professor', 'aluno', 'video', 'image', 'document'] })
  category: 'literario' | 'professor' | 'aluno' | 'video' | 'image' | 'document';

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  checksum?: string;

  @Column({ nullable: true })
  uploaded_by?: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 