import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  author_id: string;

  @Column({ type: 'timestamp', nullable: true })
  expires_at?: Date;

  @Column({
    type: 'enum',
    enum: ['baixa', 'média', 'alta', 'urgente'],
    default: 'média'
  })
  priority: string;

  @Column({ type: 'jsonb' })
  scope: {
    type: 'global' | 'turma' | 'curso';
    targetId?: string;
  };

  @Column({ type: 'jsonb' })
  notifications: {
    email: boolean;
    push: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  attachments?: any[];

  @Column({ type: 'jsonb', default: [] })
  acknowledgments: string[]; // IDs de usuários

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}