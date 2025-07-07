import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('video')
export class Video {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'api_id', type: 'varchar', length: 255, nullable: true })
  apiId?: string;

  @Column({ name: 'date_created', type: 'timestamp', nullable: true })
  dateCreated?: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ name: 'imdb_id', type: 'varchar', length: 255, nullable: true })
  imdbId?: string;

  @Column({ name: 'intro_end', type: 'int', nullable: true })
  introEnd?: number;

  @Column({ name: 'intro_start', type: 'int', nullable: true })
  introStart?: number;

  @Column({ name: 'last_updated', type: 'timestamp', nullable: true })
  lastUpdated?: Date;

  @Column({ name: 'original_language', type: 'varchar', length: 255, nullable: true })
  originalLanguage?: string;

  @Column({ name: 'outro_start', type: 'int', nullable: true })
  outroStart?: number;

  @Column({ type: 'text', nullable: true })
  overview?: string;

  @Column({ type: 'double precision', nullable: true })
  popularity?: number;

  @Column({ name: 'report_count', type: 'int', nullable: true })
  reportCount?: number;

  @Column({ name: 'vote_average', type: 'double precision', nullable: true })
  voteAverage?: number;

  @Column({ name: 'vote_count', type: 'int', nullable: true })
  voteCount?: number;

  @Column({ type: 'varchar', length: 255 })
  class!: string;

  @Column({ name: 'backdrop_path', type: 'varchar', length: 255, nullable: true })
  backdropPath?: string;

  @Column({ name: 'poster_image_id', type: 'bigint', nullable: true })
  posterImageId?: number;

  @Column({ name: 'poster_path', type: 'varchar', length: 255, nullable: true })
  posterPath?: string;

  @Column({ name: 'release_date', type: 'varchar', length: 255, nullable: true })
  releaseDate?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ name: 'trailer_key', type: 'varchar', length: 255, nullable: true })
  trailerKey?: string;

  @Column({ name: 'backdrop_image_id', type: 'bigint', nullable: true })
  backdropImageId?: number;

  @Column({ name: 'air_date', type: 'varchar', length: 255, nullable: true })
  airDate?: string;

  @Column({ name: 'episode_string', type: 'varchar', length: 255, nullable: true })
  episodeString?: string;

  @Column({ name: 'episode_number', type: 'int', nullable: true })
  episodeNumber?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ name: 'season_episode_merged', type: 'int', nullable: true })
  seasonEpisodeMerged?: number;

  @Column({ name: 'season_number', type: 'int', nullable: true })
  seasonNumber?: number;

  @Column({ name: 'show_id', type: 'bigint', nullable: true })
  showId?: number;

  @Column({ name: 'still_image_id', type: 'bigint', nullable: true })
  stillImageId?: number;

  @Column({ name: 'still_path', type: 'varchar', length: 255, nullable: true })
  stillPath?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  duration?: string;

  @Column({ nullable: true })
  module_id?: number;
}