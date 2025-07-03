import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { Institution } from './Institution';
import { TvShowVideo } from './TvShowVideo';

@Entity('tv_shows')
export class TvShow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  synopsis?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  cover_image_url?: string;

  @Column({ nullable: true })
  banner_image_url?: string;

  @Column({ nullable: true })
  trailer_url?: string;

  // Metadados da série
  @Column({ type: 'int', default: 0 })
  total_episodes: number;

  @Column({ type: 'int', default: 1 })
  total_seasons: number;

  @Column({ type: 'int', default: 0 })
  total_duration: number; // em segundos

  @Column({ type: 'date', nullable: true })
  release_date?: Date;

  @Column({ nullable: true })
  genre?: string;

  @Column({ nullable: true })
  target_audience?: string; // infantil, juvenil, adulto, etc

  @Column({ nullable: true })
  content_rating?: string; // livre, 10+, 12+, etc

  // Relacionamentos
  @Column({ nullable: true })
  created_by?: string;

  @Index()
  @Column()
  institution_id: string;

  @ManyToOne(() => Institution, institution => institution.tvShows)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  // Metadados educacionais
  @Column({ type: 'jsonb', nullable: true })
  education_cycle?: {
    level: string;
    cycle?: string;
    grade?: string;
  };

  @Column({ type: 'jsonb', default: [] })
  subjects: string[]; // disciplinas abordadas

  @Column({ type: 'jsonb', default: [] })
  authors: string[]; // autores/criadores

  @Column({ type: 'jsonb', default: [] })
  tags: string[]; // tags para busca

  @Column({ default: 'pt-BR' })
  language: string;

  @Column({ type: 'enum', enum: ['basic', 'intermediate', 'advanced'], default: 'basic' })
  difficulty_level: 'basic' | 'intermediate' | 'advanced';

  // Controle de acesso
  @Column({ default: false })
  is_public: boolean;

  @Column({ default: false })
  is_premium: boolean;

  @Column({ default: false })
  is_featured: boolean; // destaque na plataforma

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  status: 'draft' | 'published' | 'archived';

  // Estatísticas
  @Column({ type: 'int', default: 0 })
  views_count: number;

  @Column({ type: 'int', default: 0 })
  likes_count: number;

  @Column({ type: 'int', default: 0 })
  favorites_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating_average: number;

  @Column({ type: 'int', default: 0 })
  rating_count: number;

  // Metadados de arquivo/produção
  @Column({ type: 'jsonb', nullable: true })
  production_info?: {
    studio?: string;
    director?: string;
    year?: number;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  technical_specs?: {
    quality?: string;
    format?: string;
    [key: string]: any;
  };

  @OneToMany(() => TvShowVideo, tvShowVideo => tvShowVideo.tvShow)
  episodes: TvShowVideo[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 