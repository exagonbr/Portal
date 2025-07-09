import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('notification_queue')
export class NotificationQueue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  version?: string;

  @Column({ nullable: true })
  dateCreated?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  isCompleted?: string;

  @Column({ nullable: true })
  lastUpdated?: string;

  @Column({ nullable: true })
  movieId?: string;

  @Column({ nullable: true })
  tvShowId?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  videoToPlayId?: string;

  @ManyToOne(() => Movie)
  @JoinColumn({ name: 'movie_id' })
  movie?: Movie;

  @ManyToOne(() => TvShow)
  @JoinColumn({ name: 'tv_show_id' })
  tvShow?: TvShow;

  @ManyToOne(() => VideoToPlay)
  @JoinColumn({ name: 'video_to_play_id' })
  videoToPlay?: VideoToPlay;

}