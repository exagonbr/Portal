import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique
} from 'typeorm';

@Entity('viewing_status')
@Unique('idx_user_video_unique', ['userId', 'videoId'])
@Unique('idx_user_tvshow_video_unique', ['userId', 'tvShowId', 'videoId'])
@Unique('idx_user_content_unique', ['userId', 'contentType', 'contentId'])
@Index(['userId', 'completed'])
@Index(['userId', 'lastWatchedAt'])
@Index(['videoId'])
@Index(['tvShowId'])
@Index(['contentType', 'contentId'])
@Index(['completed'])
@Index(['completionPercentage'])
@Index(['lastWatchedAt'])
@Index(['deviceType'])
@Index(['classId'])
@Index(['institutionId'])
export class ViewingStatus {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  // Referências principais
  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @Column({ name: 'video_id', type: 'bigint', nullable: true })
  videoId?: number;

  @Column({ name: 'tv_show_id', type: 'bigint', nullable: true })
  tvShowId?: number;

  @Column({ name: 'content_id', type: 'bigint', nullable: true })
  contentId?: number;

  @Column({ name: 'content_type', type: 'varchar', length: 50, nullable: true })
  contentType?: string;

  // Dados de progresso
  @Column({ name: 'current_play_time', type: 'int', default: 0 })
  currentPlayTime!: number;

  @Column({ name: 'total_duration', type: 'int', nullable: true })
  totalDuration?: number;

  @Column({ name: 'completion_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  completionPercentage!: number;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  // Dados de sessão
  @Column({ name: 'watch_sessions_count', type: 'int', default: 0 })
  watchSessionsCount!: number;

  @Column({ name: 'total_watch_time', type: 'int', default: 0 })
  totalWatchTime!: number;

  @Column({ name: 'last_watched_at', type: 'timestamp', nullable: true })
  lastWatchedAt?: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  // Configurações do player
  @Column({ type: 'varchar', length: 20, nullable: true })
  quality?: string;

  @Column({ name: 'playback_speed', type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  playbackSpeed!: number;

  @Column({ name: 'subtitle_language', type: 'varchar', length: 10, nullable: true })
  subtitleLanguage?: string;

  @Column({ name: 'audio_language', type: 'varchar', length: 10, nullable: true })
  audioLanguage?: string;

  @Column({ name: 'auto_play_enabled', type: 'boolean', default: true })
  autoPlayEnabled!: boolean;

  // Dados de interação
  @Column({ name: 'pauses_count', type: 'int', default: 0 })
  pausesCount!: number;

  @Column({ name: 'seeks_count', type: 'int', default: 0 })
  seeksCount!: number;

  @Column({ name: 'replay_count', type: 'int', default: 0 })
  replayCount!: number;

  @Column({ name: 'interaction_data', type: 'jsonb', nullable: true })
  interactionData?: any;

  // Dados do dispositivo
  @Column({ name: 'device_type', type: 'varchar', length: 50, default: 'web' })
  deviceType!: string;

  @Column({ name: 'device_id', type: 'varchar', length: 255, nullable: true })
  deviceId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  os?: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  // Dados de contexto
  @Column({ name: 'course_id', type: 'bigint', nullable: true })
  courseId?: number;

  @Column({ name: 'module_id', type: 'bigint', nullable: true })
  moduleId?: number;

  @Column({ name: 'lesson_id', type: 'bigint', nullable: true })
  lessonId?: number;

  @Column({ name: 'class_id', type: 'bigint', nullable: true })
  classId?: number;

  @Column({ name: 'institution_id', type: 'bigint', nullable: true })
  institutionId?: number;

  // Controle e versionamento
  @Column({ type: 'bigint', default: 1 })
  version!: number;

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 