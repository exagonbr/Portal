import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { ForumReply } from './ForumReply';

@Entity('forum_threads')
export class ForumThread {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  author_id: string;

  @Column()
  class_id: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: any[];

  @Column({ default: false })
  is_pinned: boolean;

  @Column({ default: false })
  is_locked: boolean;

  @Column({ type: 'int', default: 0 })
  views_count: number;

  @OneToMany(() => ForumReply, reply => reply.thread)
  replies: ForumReply[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}