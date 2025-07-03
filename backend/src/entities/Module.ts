import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Collection } from './Collection';

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

  @ManyToOne(() => Collection, collection => collection.modules)
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}