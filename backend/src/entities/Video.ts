import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Module } from './Module';
import { Collection } from './Collection';
import { User } from './User';
import { VideoFile } from './VideoFile';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  video_url: string;

  @Column({ nullable: true })
  thumbnail_url?: string;

  @Column({ type: 'int' })
  duration: number; // em segundos

  @Column({ default: 'HD' })
  quality: string; // SD, HD, FHD, 4K

  @Column({ default: 'mp4' })
  format: string; // mp4, avi, mkv, etc

  @Column({ type: 'bigint', nullable: true })
  file_size?: number; // em bytes

  @Column({ nullable: true })
  resolution?: string; // 1920x1080, 1280x720, etc

  // Relacionamentos
  @Column({ nullable: true })
  module_id?: string;

  @ManyToOne(() => Module, module => module.videos, { nullable: true })
  @JoinColumn({ name: 'module_id' })
  module?: Module;

  @Column({ nullable: true })
  collection_id?: string;

  @ManyToOne(() => Collection, { nullable: true })
  @JoinColumn({ name: 'collection_id' })
  collection?: Collection;

  @Column({ nullable: true })
  created_by?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  // Metadados educacionais
  @Column({ type: 'jsonb', nullable: true })
  education_cycle?: {
    level: string;
    cycle?: string;
    grade?: string;
  };

  @Column({ type: 'jsonb', default: [] })
  authors: string[];

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ nullable: true })
  subject?: string;

  @Column({ type: 'enum', enum: ['basic', 'intermediate', 'advanced'], default: 'basic' })
  difficulty_level: 'basic' | 'intermediate' | 'advanced';

  // Controle de acesso
  @Column({ default: false })
  is_public: boolean;

  @Column({ default: false })
  is_premium: boolean;

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  // Estatísticas
  @Column({ type: 'int', default: 0 })
  views_count: number;

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating_average: number;

  @Column({ type: 'int', default: 0 })
  rating_count: number;

  @OneToMany(() => VideoFile, videoFile => videoFile.video)
  files: VideoFile[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}