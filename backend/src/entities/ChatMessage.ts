import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  sender_id!: number;

  @ManyToOne(() => User, (user: User) => user.sentMessages)
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @Column({ type: 'text' })
  content!: string;

  @Column()
  class_id!: number;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: any[];

  @Column({ type: 'jsonb', default: [] })
  read_by!: string[]; // IDs de usuários

  @CreateDateColumn()
  timestamp!: Date;
}