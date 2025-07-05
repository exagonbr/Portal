import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { VideoCollection } from './VideoCollection';

@Entity('video_modules')
export class VideoModule {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'int' })
  collection_id!: number;

  @ManyToOne(() => VideoCollection, collection => collection.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection!: VideoCollection;

  @Column({ type: 'integer' })
  module_number!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  synopsis!: string;

  @Column({ type: 'integer' })
  release_year!: number;

  @Column({ type: 'varchar', length: 20, default: '00:00:00' })
  duration!: string;

  @Column({ type: 'varchar', length: 100 })
  education_cycle!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  poster_image_url?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  video_url?: string;

  @Column({ type: 'integer', default: 1 })
  order_in_module!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}