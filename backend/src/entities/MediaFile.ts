import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { File } from './File';
import { MediaEntry } from './MediaEntry';

@Entity('media_file')
export class MediaFile {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'date_created', type: 'timestamp', nullable: true })
  dateCreated?: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ name: 'file_id', type: 'bigint', nullable: true })
  fileId?: number;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'file_id' })
  file?: File;

  @Column({ name: 'last_updated', type: 'timestamp', nullable: true })
  lastUpdated?: Date;

  @Column({ name: 'media_entry_id', type: 'bigint', nullable: true })
  mediaEntryId?: number;

  @ManyToOne(() => MediaEntry, { nullable: true })
  @JoinColumn({ name: 'media_entry_id' })
  mediaEntry?: MediaEntry;

  @Column({ type: 'varchar', length: 255, nullable: true })
  uuid?: string;
}