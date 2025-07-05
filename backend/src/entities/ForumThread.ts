import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { ForumReply } from './ForumReply';

@Entity('forum_threads')
export class ForumThread {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  class_id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column()
  author_id!: number;

  @ManyToOne(() => User, user => user.forumThreads)
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({ type: 'jsonb', default: [] })
  tags!: string[];

  @Column({ type: 'jsonb', nullable: true })
  attachments?: any[];

  @Column({ default: false })
  pinned!: boolean;

  @Column({ default: false })
  locked!: boolean;

  @Column({ type: 'int', default: 0 })
  views!: number;

  @OneToMany(() => ForumReply, reply => reply.thread)
  replies!: ForumReply[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}