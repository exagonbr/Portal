import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Author } from './Author';
import { EducationPeriod } from './EducationPeriod';
import { EducationalStage } from './EducationalStage';
import { Genre } from './Genre';
import { Language } from './Language';
import { Publisher } from './Publisher';
import { Subject } from './Subject';

@Entity('media_entry')
export class MediaEntry {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'amount_of_views', type: 'int', nullable: true })
  amountOfViews?: number;

  @Column({ name: 'author_id', type: 'bigint', nullable: true })
  authorId?: number;

  @ManyToOne(() => Author, { nullable: true })
  @JoinColumn({ name: 'author_id' })
  author?: Author;

  @Column({ name: 'date_created', type: 'timestamp', nullable: true })
  dateCreated?: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'education_period_id', type: 'bigint', nullable: true })
  educationPeriodId?: number;

  @ManyToOne(() => EducationPeriod, { nullable: true })
  @JoinColumn({ name: 'education_period_id' })
  educationPeriod?: EducationPeriod;

  @Column({ name: 'educational_stage_id', type: 'bigint', nullable: true })
  educationalStageId?: number;

  @ManyToOne(() => EducationalStage, { nullable: true })
  @JoinColumn({ name: 'educational_stage_id' })
  educationalStage?: EducationalStage;

  @Column({ type: 'boolean', nullable: true })
  enabled?: boolean;

  @Column({ name: 'genre_id', type: 'bigint', nullable: true })
  genreId?: number;

  @ManyToOne(() => Genre, { nullable: true })
  @JoinColumn({ name: 'genre_id' })
  genre?: Genre;

  @Column({ type: 'varchar', length: 255, nullable: true })
  isbn?: string;

  @Column({ name: 'language_id', type: 'bigint', nullable: true })
  languageId?: number;

  @ManyToOne(() => Language, { nullable: true })
  @JoinColumn({ name: 'language_id' })
  language?: Language;

  @Column({ name: 'last_updated', type: 'timestamp', nullable: true })
  lastUpdated?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ name: 'publisher_id', type: 'bigint', nullable: true })
  publisherId?: number;

  @ManyToOne(() => Publisher, { nullable: true })
  @JoinColumn({ name: 'publisher_id' })
  publisher?: Publisher;

  @Column({ name: 'subject_id', type: 'bigint', nullable: true })
  subjectId?: number;

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject?: Subject;

  @Column({ type: 'varchar', length: 255, nullable: true })
  uuid?: string;

  @Column({ name: 'year_of_publication', type: 'int', nullable: true })
  yearOfPublication?: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean;

  @Column({ name: 'is_new', type: 'boolean', default: false })
  isNew!: boolean;

  @Column({ name: 'is_popular', type: 'boolean', default: false })
  isPopular!: boolean;

  @Column({ name: 'is_recommended', type: 'boolean', default: false })
  isRecommended!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tags?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  keywords?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subcategory?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  type?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  format?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  duration?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pages?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  size?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preview?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rating?: number;

  @Column({ type: 'int', nullable: true })
  reviews?: number;

  @Column({ type: 'int', nullable: true })
  downloads?: number;

  @Column({ type: 'int', nullable: true })
  likes?: number;

  @Column({ type: 'int', nullable: true })
  shares?: number;

  @Column({ type: 'int', nullable: true })
  comments?: number;
}