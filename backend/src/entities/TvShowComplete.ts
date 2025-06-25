import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn
} from 'typeorm';

@Entity('tv_show')
export class TvShowComplete {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'varchar', nullable: true })
  producer: string;

  @Column({ type: 'varchar', nullable: true })
  poster_path: string;

  @Column({ type: 'varchar', nullable: true })
  backdrop_path: string;

  @Column({ type: 'varchar', nullable: true })
  total_load: string;

  @Column({ type: 'real', nullable: true })
  popularity: number;

  @Column({ type: 'real', nullable: true })
  vote_average: number;

  @Column({ type: 'integer', nullable: true })
  vote_count: number;

  @Column({ type: 'varchar', nullable: true })
  api_id: string;

  @Column({ type: 'varchar', nullable: true })
  imdb_id: string;

  @Column({ type: 'varchar', nullable: true })
  original_language: string;

  @Column({ type: 'timestamp', nullable: false })
  first_air_date: Date;

  @Column({ type: 'timestamp', nullable: false })
  contract_term_end: Date;

  @Column({ type: 'text', nullable: true })
  deleted: string;

  @Column({ type: 'text', nullable: true })
  manual_input: string;

  @Column({ type: 'bigint', nullable: true })
  manual_support_id: number;

  @Column({ type: 'varchar', nullable: true })
  manual_support_path: string;

  @Column({ type: 'bigint', nullable: true })
  poster_image_id: number;

  @Column({ type: 'bigint', nullable: true })
  backdrop_image_id: number;

  @Column({ type: 'bigint', nullable: true })
  version: number;

  @Column({ type: 'timestamp', nullable: false })
  date_created: Date;

  @Column({ type: 'timestamp', nullable: false })
  last_updated: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relações
  @OneToMany(() => TvShowVideo, video => video.tvShow)
  videos: TvShowVideo[];

  @OneToMany(() => TvShowQuestion, question => question.tvShow)
  questions: TvShowQuestion[];

  @OneToMany(() => TvShowFile, file => file.tvShow)
  files: TvShowFile[];

  @ManyToMany(() => TvShowAuthor)
  @JoinTable({
    name: 'tv_show_author',
    joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'author_id', referencedColumnName: 'id' }
  })
  authors: TvShowAuthor[];

  @ManyToMany(() => TvShowTargetAudience)
  @JoinTable({
    name: 'tv_show_target_audience',
    joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'target_audience_id', referencedColumnName: 'id' }
  })
  targetAudiences: TvShowTargetAudience[];
}

// Entidade para vídeos da coleção
@Entity('video')
export class TvShowVideo {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  duration: string;

  @Column({ type: 'varchar', nullable: true })
  video_url: string;

  @Column({ type: 'varchar', nullable: true })
  poster_url: string;

  @Column({ type: 'integer', nullable: false, default: 1 })
  module_number: number;

  @Column({ type: 'integer', nullable: false, default: 1 })
  episode_number: number;

  @Column({ type: 'integer', nullable: false, default: 1 })
  order_in_module: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relação com tv_show
  @ManyToOne(() => TvShowComplete, tvShow => tvShow.videos)
  @JoinColumn({ name: 'tv_show_id' })
  tvShow: TvShowComplete;

  @Column({ type: 'bigint' })
  tv_show_id: number;

  // Relação com arquivos do vídeo
  @OneToMany(() => TvShowVideoFile, file => file.video)
  files: TvShowVideoFile[];
}

// Entidade para questões
@Entity('question')
export class TvShowQuestion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text', nullable: false })
  question_text: string;

  @Column({ type: 'varchar', nullable: false, default: 'multiple_choice' })
  question_type: string;

  @Column({ type: 'integer', nullable: false, default: 1 })
  order_number: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relação com tv_show
  @ManyToOne(() => TvShowComplete, tvShow => tvShow.questions)
  @JoinColumn({ name: 'tv_show_id' })
  tvShow: TvShowComplete;

  @Column({ type: 'bigint', nullable: true })
  tv_show_id: number;

  // Relação com vídeo específico (opcional)
  @ManyToOne(() => TvShowVideo)
  @JoinColumn({ name: 'video_id' })
  video: TvShowVideo;

  @Column({ type: 'bigint', nullable: true })
  video_id: number;

  // Relação com respostas
  @OneToMany(() => TvShowAnswer, answer => answer.question)
  answers: TvShowAnswer[];
}

// Entidade para respostas
@Entity('answer')
export class TvShowAnswer {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'text', nullable: false })
  answer_text: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_correct: boolean;

  @Column({ type: 'integer', nullable: false, default: 1 })
  order_number: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relação com questão
  @ManyToOne(() => TvShowQuestion, question => question.answers)
  @JoinColumn({ name: 'question_id' })
  question: TvShowQuestion;

  @Column({ type: 'bigint' })
  question_id: number;
}

// Entidade para arquivos
@Entity('files')
export class TvShowFile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  filename: string;

  @Column({ type: 'varchar', nullable: false })
  file_path: string;

  @Column({ type: 'varchar', nullable: true })
  file_type: string;

  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @Column({ type: 'varchar', nullable: true })
  mime_type: string;

  @Column({ type: 'varchar', nullable: false, default: 'general' })
  file_category: string; // 'video', 'poster', 'material', 'document', etc.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relação com tv_show
  @ManyToOne(() => TvShowComplete, tvShow => tvShow.files)
  @JoinColumn({ name: 'tv_show_id' })
  tvShow: TvShowComplete;

  @Column({ type: 'bigint', nullable: true })
  tv_show_id: number;
}

// Entidade para arquivos de vídeo específicos
@Entity('video_file')
export class TvShowVideoFile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  filename: string;

  @Column({ type: 'varchar', nullable: false })
  file_path: string;

  @Column({ type: 'varchar', nullable: false, default: 'video' })
  file_type: string;

  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @Column({ type: 'varchar', nullable: true })
  quality: string; // '720p', '1080p', etc.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relação com vídeo
  @ManyToOne(() => TvShowVideo, video => video.files)
  @JoinColumn({ name: 'video_id' })
  video: TvShowVideo;

  @Column({ type: 'bigint' })
  video_id: number;
}

// Entidades auxiliares
@Entity('author')
export class TvShowAuthor {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('target_audience')
export class TvShowTargetAudience {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 