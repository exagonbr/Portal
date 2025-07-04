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
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  cover_image!: string;

  @Column({ type: 'int' })
  order!: number;

  @Column()
  collection_id!: number;

  @ManyToOne(() => Collection, collection => collection.modules)
  @JoinColumn({ name: 'collection_id' })
  collection!: Collection;

  @OneToMany(() => Video, video => video.module)
  videos!: Video[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}