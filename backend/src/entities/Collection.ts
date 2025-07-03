import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Module } from './Module';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  synopsis: string;

  @Column()
  cover_image: string;

  @Column({ nullable: true })
  support_material?: string;

  @Column({ type: 'int', default: 0 })
  total_duration: number;

  @Column()
  subject: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column()
  created_by: string;

  @OneToMany(() => Module, module => module.collection)
  modules: Module[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}