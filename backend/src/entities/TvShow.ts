import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Institution } from './Institution';

@Entity('tv_show')
export class TVShow {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  api_id?: string;

  @Column({ type: 'bigint', nullable: true })
  backdrop_image_id?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  backdrop_path?: string;

  @Column({ type: 'datetime', nullable: true })
  contract_term_end?: Date;

  @Column({ type: 'datetime' })
  date_created: Date;

  @Column({ type: 'bit', nullable: true })
  deleted?: boolean;

  @Column({ type: 'datetime' })
  first_air_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imdb_id?: string;

  @Column({ type: 'datetime' })
  last_updated: Date;

  @Column({ type: 'bit', nullable: true })
  manual_input?: boolean;

  @Column({ type: 'bigint', nullable: true })
  manual_support_id?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manual_support_path?: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  original_language?: string;

  @Column({ type: 'longtext', nullable: true })
  overview?: string;

  @Column({ type: 'double', nullable: true })
  popularity?: number;

  @Column({ type: 'bigint', nullable: true })
  poster_image_id?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  poster_path?: string;

  @Column({ type: 'longtext', nullable: true })
  producer?: string;

  @Column({ type: 'double', nullable: true })
  vote_average?: number;

  @Column({ type: 'int', nullable: true })
  vote_count?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  total_load?: string;

  @ManyToOne(() => Institution, institution => institution.tvShows)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;
}