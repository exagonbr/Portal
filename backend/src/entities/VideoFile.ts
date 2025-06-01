import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Video } from './Video';
import { File } from './File';

@Entity('video_files')
export class VideoFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  video_id: string;

  @ManyToOne(() => Video, video => video.files)
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @Column()
  file_id: string;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file: File;

  @Column({ type: 'enum', enum: ['video', 'thumbnail', 'subtitle', 'transcript', 'attachment'] })
  file_type: 'video' | 'thumbnail' | 'subtitle' | 'transcript' | 'attachment';

  @Column({ nullable: true })
  quality?: string; // para vídeos: SD, HD, FHD, 4K

  @Column({ nullable: true })
  language?: string; // para legendas/transcrições

  @Column({ type: 'int', default: 0 })
  order_index: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 