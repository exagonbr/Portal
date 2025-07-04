import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { File } from './File';

@Entity('tv_show')
export class TvShow {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'api_id', type: 'varchar', length: 255, nullable: true })
  apiId?: string;

  @Column({ name: 'backdrop_image_id', type: 'bigint', nullable: true })
  backdropImageId?: number;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'backdrop_image_id' })
  backdropImage?: File;

  @Column({ name: 'backdrop_path', type: 'varchar', length: 255, nullable: true })
  backdropPath?: string;

  @Column({ name: 'contract_term_end', type: 'datetime' })
  contractTermEnd!: Date;

  @Column({ name: 'date_created', type: 'datetime' })
  dateCreated!: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ name: 'first_air_date', type: 'datetime' })
  firstAirDate!: Date;

  @Column({ name: 'imdb_id', type: 'varchar', length: 255, nullable: true })
  imdbId?: string;

  @Column({ name: 'last_updated', type: 'datetime' })
  lastUpdated!: Date;

  @Column({ name: 'manual_input', type: 'boolean', nullable: true })
  manualInput?: boolean;

  @Column({ name: 'manual_support_id', type: 'bigint', nullable: true })
  manualSupportId?: number;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'manual_support_id' })
  manualSupport?: File;

  @Column({ name: 'manual_support_path', type: 'varchar', length: 255, nullable: true })
  manualSupportPath?: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'original_language', type: 'varchar', length: 255, nullable: true })
  originalLanguage?: string;

  @Column({ type: 'longtext', nullable: true })
  overview?: string;

  @Column({ type: 'double', nullable: true })
  popularity?: number;

  @Column({ name: 'poster_image_id', type: 'bigint', nullable: true })
  posterImageId?: number;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'poster_image_id' })
  posterImage?: File;

  @Column({ name: 'poster_path', type: 'varchar', length: 255, nullable: true })
  posterPath?: string;

  @Column({ type: 'longtext', nullable: true })
  producer?: string;

  @Column({ name: 'vote_average', type: 'double', nullable: true })
  voteAverage?: number;

  @Column({ name: 'vote_count', type: 'int', nullable: true })
  voteCount?: number;

  @Column({ name: 'total_load', type: 'varchar', length: 255, nullable: true })
  totalLoad?: string;
}