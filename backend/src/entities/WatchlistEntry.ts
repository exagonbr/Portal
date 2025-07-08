import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('watchlist_entry')
export class WatchlistEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  videoId?: string;

  @Column({ nullable: true })
  addedAt?: string;

  @Column({ nullable: true })
  watched?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Video)
  @JoinColumn({ name: 'video_id' })
  video?: Video;

}