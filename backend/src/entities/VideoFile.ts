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

@Entity('video_file')
export class VideoFile {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'video_files_id', type: 'bigint' })
  videoFilesId!: number;

  @Column({ name: 'file_id', type: 'bigint', nullable: true })
  fileId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relacionamentos
  @ManyToOne(() => Video, video => video.videoFiles)
  @JoinColumn({ name: 'video_files_id' })
  video?: Video;

  @ManyToOne(() => File)
  @JoinColumn({ name: 'file_id' })
  file?: File;
} 