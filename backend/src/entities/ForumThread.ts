import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
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

  @ManyToOne(() => User, user => user.forumThreads)
  @JoinColumn({ name: 'author_id' })
  author: User;

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
