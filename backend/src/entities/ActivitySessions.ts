import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('activity_sessions')
export class ActivitySessions {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  startTime?: string;

  @Column({ nullable: true })
  endTime?: string;

  @Column({ nullable: true })
  durationSeconds?: string;

  @Column({ nullable: true })
  pageViews?: string;

  @Column({ nullable: true })
  actionsCount?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  deviceInfo?: string;

  @Column({ nullable: true })
  isActive?: string;

  @Column({ nullable: true })
  lastActivity?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}