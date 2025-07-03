import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Author } from './Author';

@Entity('content_authors')
export class ContentAuthor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  author_id: string;

  @ManyToOne(() => Author, author => author.contentAuthors)
  @JoinColumn({ name: 'author_id' })
  author: Author;

  @Column()
  content_id: string; // pode ser video_id, tv_show_id, etc

  @Column({ type: 'enum', enum: ['video', 'tv_show', 'collection', 'book', 'course'] })
  content_type: 'video' | 'tv_show' | 'collection' | 'book' | 'course';

  @Column({ type: 'enum', enum: ['creator', 'director', 'producer', 'editor', 'narrator', 'consultant'], default: 'creator' })
  role: 'creator' | 'director' | 'producer' | 'editor' | 'narrator' | 'consultant';

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 