import { Video } from "./Video";
import { User } from "./User";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('report')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  version?: string;

  @Column({ nullable: true })
  createdById?: string;

  @Column({ nullable: true })
  dateCreated?: string;

  @Column({ nullable: true })
  errorCode?: string;

  @Column({ nullable: true })
  lastUpdated?: string;

  @Column({ nullable: true })
  resolved?: string;

  @Column({ nullable: true })
  videoId?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;

  @ManyToOne(() => Video)
  @JoinColumn({ name: 'video_id' })
  video?: Video;

}