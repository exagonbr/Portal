import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany
} from 'typeorm';
import { Class } from './Class';

export enum EducationLevel {
  EDUCACAO_INFANTIL = 'EDUCACAO_INFANTIL',
  ENSINO_FUNDAMENTAL_I = 'ENSINO_FUNDAMENTAL_I',
  ENSINO_FUNDAMENTAL_II = 'ENSINO_FUNDAMENTAL_II',
  ENSINO_MEDIO = 'ENSINO_MEDIO',
  ENSINO_TECNICO = 'ENSINO_TECNICO',
  ENSINO_SUPERIOR = 'ENSINO_SUPERIOR'
}

@Entity('education_cycles')
export class EducationCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: EducationLevel
  })
  level: EducationLevel;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int' })
  duration_years: number;

  @Column({ type: 'int', nullable: true })
  min_age?: number;

  @Column({ type: 'int', nullable: true })
  max_age?: number;

  @ManyToMany(() => Class, classEntity => classEntity.educationCycles)
  classes: Class[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Propriedades computadas
  total_students?: number;
  total_teachers?: number;
}