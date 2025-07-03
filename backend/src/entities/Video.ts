import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Module } from './Module';

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  module_id: string;

  @ManyToOne(() => Module, module => module.videos)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @Column()
  video_url: string;

  @Column({ type: 'int' })
  duration: number; // em segundos

  @Column({ type: 'jsonb', default: [] })
  authors: string[];

  @Column({ type: 'jsonb' })
  education_cycle: {
    level: string;
    cycle?: string;
    grade?: string;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}