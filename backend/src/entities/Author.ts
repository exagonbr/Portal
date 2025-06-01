import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { ContentAuthor } from './ContentAuthor';

@Entity('authors')
export class Author {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ nullable: true })
  avatar_url?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ type: 'jsonb', default: {} })
  social_links: Record<string, string>; // linkedin, twitter, etc

  @Column({ nullable: true })
  specialization?: string; // área de especialização

  @Column({ type: 'enum', enum: ['internal', 'external', 'guest'], default: 'internal' })
  type: 'internal' | 'external' | 'guest';

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => ContentAuthor, contentAuthor => contentAuthor.author)
  contentAuthors: ContentAuthor[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 