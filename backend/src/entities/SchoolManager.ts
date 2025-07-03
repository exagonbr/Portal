import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { School } from './School';

export enum ManagerPosition {
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  COORDINATOR = 'COORDINATOR',
  SUPERVISOR = 'SUPERVISOR'
}

@Entity('school_managers')
export class SchoolManager {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  school_id: string;

  @ManyToOne(() => School, school => school.managers)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({
    type: 'enum',
    enum: ManagerPosition
  })
  position: ManagerPosition;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Propriedades computadas
  user_name?: string;
  user_email?: string;
  school_name?: string;
  school_code?: string;
  institution_name?: string;
  institution_id?: string;
}