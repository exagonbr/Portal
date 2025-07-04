import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  title!: string;

  @Column()
  author!: string;

  @Column()
  publisher!: string;

  @Column({ type: 'text' })
  synopsis!: string;

  @Column()
  thumbnail!: string;

  @Column()
  url!: string;

  @Column({ nullable: true })
  s3_key?: string;

  @Column({ type: 'int' })
  size!: number;

  @Column()
  education_level!: string;

  @Column({ nullable: true })
  cycle?: string;

  @Column({ nullable: true })
  grade?: string;

  @Column({ nullable: true })
  subject?: string;

  @Column({ type: 'jsonb', default: [] })
  tags!: string[];

  @Column()
  uploaded_by!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}