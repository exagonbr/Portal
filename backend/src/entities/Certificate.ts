import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { TvShow } from './TvShow';
import { User } from './User';

@Entity('certificate')
export class Certificate {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'date_created', type: 'datetime' })
  dateCreated!: Date;

  @Column({ name: 'last_updated', type: 'datetime', nullable: true })
  lastUpdated?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  path?: string;

  @Column({ type: 'bigint', nullable: true })
  score?: number;

  @Column({ name: 'tv_show_id', type: 'bigint', nullable: true })
  tvShowId?: number;

  @ManyToOne(() => TvShow, { nullable: true })
  @JoinColumn({ name: 'tv_show_id' })
  tvShow?: TvShow;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  document?: string;

  @Column({ name: 'license_code', type: 'varchar', length: 255, nullable: true })
  licenseCode?: string;

  @Column({ name: 'tv_show_name', type: 'varchar', length: 255, nullable: true })
  tvShowName?: string;

  @Column({ type: 'boolean', default: true })
  recreate!: boolean;
}