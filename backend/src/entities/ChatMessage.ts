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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sender_id: string;

  @ManyToOne(() => User, user => user.sentMessages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  content: string;

  @Column()
  class_id: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments?: any[];

  @Column({ type: 'jsonb', default: [] })
  read_by: string[]; // IDs de usuários

  @CreateDateColumn()
  timestamp: Date;
}
