import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn
} from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sender_id: string;

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