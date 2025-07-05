import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { School } from './School';

export enum ManagerPosition {
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  COORDINATOR = 'COORDINATOR',
  SUPERVISOR = 'SUPERVISOR'
}

@Entity('school_managers')
export class SchoolManager {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  user_id!: number;

  @ManyToOne(() => User, user => user.schoolManagers)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  school_id!: number;

  @JoinColumn({ name: 'school_id' })
  school!: School;

  @Column({
    type: 'enum',
    enum: ManagerPosition
  })
  position!: ManagerPosition;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  start_date!: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Propriedades computadas
  user_name?: string;
  user_email?: string;
  school_name?: string;
  school_code?: string;
  institution_name?: string;
  institution_id?: number;
}