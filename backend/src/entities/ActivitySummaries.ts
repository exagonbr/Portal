import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('activity_summaries')
export class ActivitySummaries {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  date?: string;

  @Column({ nullable: true })
  totalTimeSeconds?: string;

  @Column({ nullable: true })
  pageViews?: string;

  @Column({ nullable: true })
  videoTimeSeconds?: string;

  @Column({ nullable: true })
  videosWatched?: string;

  @Column({ nullable: true })
  quizzesAttempted?: string;

  @Column({ nullable: true })
  assignmentsSubmitted?: string;

  @Column({ nullable: true })
  loginCount?: string;

  @Column({ nullable: true })
  uniqueSessions?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}