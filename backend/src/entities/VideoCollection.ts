import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { VideoModule } from './VideoModule';

@Entity('video_collections')
export class VideoCollection {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'integer', nullable: true })
  mysql_id?: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  synopsis?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  producer?: string;

  @Column({ type: 'date', nullable: true })
  release_date?: Date;

  @Column({ type: 'date', nullable: true })
  contract_expiry_date?: Date;

  @Column({ type: 'simple-array', default: [] })
  authors!: string[];

  @Column({ type: 'simple-array', default: [] })
  target_audience!: string[];

  @Column({ type: 'varchar', length: 20, default: '00:00:00' })
  total_hours!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  poster_image_url?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  carousel_image_url?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ebook_file_url?: string;

  @Column({ type: 'boolean', default: true })
  use_default_cover_for_videos!: boolean;

  @Column({ type: 'double precision', nullable: true })
  popularity?: number;

  @Column({ type: 'double precision', nullable: true })
  vote_average?: number;

  @Column({ type: 'integer', nullable: true })
  vote_count?: number;

  // Campos legados do MySQL
  @Column({ type: 'varchar', length: 255, nullable: true })
  poster_path?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  backdrop_path?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  total_load?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manual_support_path?: string;

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  @OneToMany(() => VideoModule, videoModule => videoModule.collection, { cascade: true })
  videos!: VideoModule[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
} 