import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';
import { Collection } from './Collection';
import { Video } from './Video';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  cover_image: string;

  @Column({ type: 'int' })
  order: number;

  @Column()
  collection_id: string;

  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  videos: Video[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}