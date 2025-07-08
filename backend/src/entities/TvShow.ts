import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tv_show')
export class TvShow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  version?: string;

  @Column({ nullable: true })
  dateCreated?: string;

  @Column({ nullable: true })
  deleted?: string;

  @Column({ nullable: true })
  lastUpdated?: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  duration?: string;

  @Column({ nullable: true })
  rating?: string;

  @Column({ nullable: true })
  releaseYear?: string;

  @Column({ nullable: true })
  isActive?: string;

}