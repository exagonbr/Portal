import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

// ===================== MAIN TV SHOW ENTITY =====================

@Entity('tv_show')
@Index(['name'])
@Index(['api_id'])
@Index(['deleted'])
export class TvShowComplete {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  name: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  producer: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  poster_path: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  backdrop_path: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  total_load: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true, default: 0 })
  popularity: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true, default: 0 })
  vote_average: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  vote_count: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  api_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  imdb_id: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  original_language: string;

  @Column({ type: 'date', nullable: true })
  first_air_date: Date;

  @Column({ type: 'date', nullable: true })
  contract_term_end: Date;

  @Column({ type: 'int', nullable: true })
  poster_image_id: number;

  @Column({ type: 'int', nullable: true })
  backdrop_image_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true, default: '1.0' })
  version: string;

  @Column({ type: 'bit', nullable: true, default: 0 })
  deleted: boolean;

  @Column({ type: 'bit', nullable: true, default: 0 })
  manual_input: boolean;

  @CreateDateColumn()
  date_created: Date;

  @UpdateDateColumn()
  last_updated: Date;

  // Comentadas para evitar problemas de relação
  // @OneToMany(() => TvShowVideo, video => video.tvShow)
  // videos: TvShowVideo[];

  // @OneToMany(() => TvShowQuestion, question => question.tvShow)
  // questions: TvShowQuestion[];

  // @OneToMany(() => TvShowFile, file => file.tvShow)
  // files: TvShowFile[];

  // @ManyToMany(() => TvShowAuthor)
  // @JoinTable({
  //   name: 'tv_show_author_mapping',
  //   joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'author_id', referencedColumnName: 'id' }
  // })
  // authors: TvShowAuthor[];

  // @ManyToMany(() => TvShowGenre)
  // @JoinTable({
  //   name: 'tv_show_genre_mapping',
  //   joinColumn: { name: 'tv_show_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' }
  // })
  // genres: TvShowGenre[];
}

// ===================== VIDEO ENTITY =====================

@Entity('video')
@Index(['tv_show_id'])
@Index(['is_active'])
export class TvShowVideo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  tv_show_id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  video_url: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  module_number: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  episode_number: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  duration_seconds: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url: string;

  @Column({ type: 'bit', default: 1 })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Comentado para evitar problemas de relação
  // @ManyToOne(() => TvShowComplete, tvShow => tvShow.videos)
  // @JoinColumn({ name: 'tv_show_id' })
  // tvShow: TvShowComplete;

  // @OneToMany(() => TvShowVideoFile, videoFile => videoFile.video)
  // files: TvShowVideoFile[];
}

// ===================== QUESTION ENTITY =====================

@Entity('tv_show_question')
@Index(['tv_show_id'])
@Index(['is_active'])
export class TvShowQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  tv_show_id: number;

  @Column({ type: 'text' })
  question_text: string;

  @Column({ type: 'varchar', length: 50, default: 'multiple_choice' })
  question_type: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  order_number: number;

  @Column({ type: 'bit', default: 1 })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Comentado para evitar problemas de relação
  // @ManyToOne(() => TvShowComplete, tvShow => tvShow.questions)
  // @JoinColumn({ name: 'tv_show_id' })
  // tvShow: TvShowComplete;

  // @OneToMany(() => TvShowAnswer, answer => answer.question)
  // answers: TvShowAnswer[];
}

// ===================== ANSWER ENTITY =====================

@Entity('tv_show_answer')
@Index(['question_id'])
@Index(['is_active'])
export class TvShowAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  question_id: number;

  @Column({ type: 'text' })
  answer_text: string;

  @Column({ type: 'bit', default: 0 })
  is_correct: boolean;

  @Column({ type: 'int', nullable: true, default: 1 })
  order_number: number;

  @Column({ type: 'bit', default: 1 })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Comentado para evitar problemas de relação
  // @ManyToOne(() => TvShowQuestion, question => question.answers)
  // @JoinColumn({ name: 'question_id' })
  // question: TvShowQuestion;
}

// ===================== FILE ENTITY =====================

@Entity('tv_show_file')
@Index(['tv_show_id'])
export class TvShowFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  tv_show_id: number;

  @Column({ type: 'varchar', length: 500 })
  file_name: string;

  @Column({ type: 'varchar', length: 500 })
  file_path: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_type: string;

  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Comentado para evitar problemas de relação
  // @ManyToOne(() => TvShowComplete, tvShow => tvShow.files)
  // @JoinColumn({ name: 'tv_show_id' })
  // tvShow: TvShowComplete;
}

// ===================== VIDEO FILE ENTITY =====================

@Entity('tv_show_video_file')
@Index(['video_id'])
export class TvShowVideoFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  video_id: number;

  @Column({ type: 'varchar', length: 500 })
  file_name: string;

  @Column({ type: 'varchar', length: 500 })
  file_path: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  file_type: string;

  @Column({ type: 'bigint', nullable: true })
  file_size: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Comentado para evitar problemas de relação
  // @ManyToOne(() => TvShowVideo, video => video.files)
  // @JoinColumn({ name: 'video_id' })
  // video: TvShowVideo;
}

// ===================== AUTHOR ENTITY =====================

@Entity('tv_show_author')
export class TvShowAuthor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  biography: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

// ===================== GENRE ENTITY =====================

@Entity('tv_show_genre')
export class TvShowGenre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 