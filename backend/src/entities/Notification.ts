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

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error'
}

export enum NotificationCategory {
  ACADEMIC = 'academic',
  SYSTEM = 'system',
  SOCIAL = 'social',
  ADMINISTRATIVE = 'administrative'
}

export enum NotificationStatus {
  SENT = 'sent',
  SCHEDULED = 'scheduled',
  DRAFT = 'draft',
  FAILED = 'failed'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO
  })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationCategory,
    default: NotificationCategory.SYSTEM
  })
  category: NotificationCategory;

  @Column({ type: 'timestamp', nullable: true })
  sent_at?: Date;

  @Column()
  sent_by_id: string;

  @ManyToOne(() => User, user => user.sentNotifications)
  @JoinColumn({ name: 'sent_by_id' })
  sentBy: User;

  @Column({ type: 'jsonb', default: {} })
  recipients: {
    total?: number;
    read?: number;
    unread?: number;
    roles?: string[];
    specific?: string[];
  };

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.DRAFT
  })
  status: NotificationStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduled_for?: Date;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM
  })
  priority: NotificationPriority;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}