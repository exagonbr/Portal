import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('file')
export class File {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'content_type', type: 'varchar', length: 255, nullable: true })
  contentType?: string;

  @Column({ name: 'date_created', type: 'datetime' })
  dateCreated!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  extension?: string;

  @Column({ name: 'external_link', type: 'varchar', length: 255, nullable: true })
  externalLink?: string;

  @Column({ name: 'is_default', type: 'boolean', nullable: true })
  isDefault?: boolean;

  @Column({ name: 'is_public', type: 'boolean', nullable: true })
  isPublic?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  label?: string;

  @Column({ name: 'last_updated', type: 'datetime' })
  lastUpdated!: Date;

  @Column({ name: 'local_file', type: 'varchar', length: 255, nullable: true })
  localFile?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ name: 'original_filename', type: 'varchar', length: 255, nullable: true })
  originalFilename?: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  quality?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  sha256hex?: string;

  @Column({ type: 'bigint', nullable: true })
  size?: number;

  @Column({ name: 'subtitle_label', type: 'varchar', length: 255, nullable: true })
  subtitleLabel?: string;

  @Column({ name: 'subtitle_src_lang', type: 'varchar', length: 255, nullable: true })
  subtitleSrcLang?: string;

  @Column({ name: 'is_subtitled', type: 'boolean', nullable: true })
  isSubtitled?: boolean;
}
