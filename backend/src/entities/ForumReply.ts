import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { ForumThread } from './ForumThread';

@Entity('forum_replies')
export class ForumReply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  author_id: string;

  @ManyToOne(() => User, user => user.forumReplies)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column()
  thread_id: string;

  @ManyToOne(() => ForumThread, thread => thread.replies)
  @JoinColumn({ name: 'thread_id' })
  thread: ForumThread;

  @Column({ nullable: true })
  parent_reply_id?: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: any[];

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
