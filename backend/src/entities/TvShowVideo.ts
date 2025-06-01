import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { TvShow } from './TvShow';

@Entity('tv_show_videos')
export class TvShowVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tv_show_id: string;

  @ManyToOne(() => TvShow, tvShow => tvShow.episodes)
  @JoinColumn({ name: 'tv_show_id' })
  tvShow: TvShow;

  @Column()
  video_id: string;

  @Column({ type: 'int', default: 1 })
  season_number: number;

  @Column({ type: 'int' })
  episode_number: number;

  @Column({ nullable: true })
  episode_title?: string;

  @Column({ type: 'text', nullable: true })
  episode_description?: string;

  @Column({ type: 'int' })
  order_index: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 