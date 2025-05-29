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
import { Institution } from './Institution';
import { Class } from './Class';
import { SchoolManager } from './SchoolManager';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  institution_id: string;

  @ManyToOne(() => Institution, institution => institution.schools)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  zip_code?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Class, classEntity => classEntity.school)
  classes: Class[];

  @OneToMany(() => SchoolManager, schoolManager => schoolManager.school)
  managers: SchoolManager[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Propriedades computadas
  total_students?: number;
  total_teachers?: number;
  total_classes?: number;
  total_managers?: number;
  active_classes?: number;
}