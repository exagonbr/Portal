import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { School } from './School';
import { UserClass } from './UserClass';
import { EducationCycle } from './EducationCycle';

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  FULL_TIME = 'FULL_TIME'
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  school_id!: string;

  @JoinColumn({ name: 'school_id' })
  school!: School;

  @Column({ type: 'int' })
  year!: number;

  @Column({
    type: 'enum',
    enum: ShiftType,
    default: ShiftType.MORNING
  })
  shift!: ShiftType;

  @Column({ type: 'int', default: 30 })
  max_students!: number;

  @Column({ default: true })
  is_active!: boolean;

  @OneToMany(() => UserClass, userClass => userClass.class)
  userClasses!: UserClass[];

  @ManyToMany(() => EducationCycle, educationCycle => educationCycle.classes)
  @JoinTable({
    name: 'class_education_cycles',
    joinColumn: { name: 'class_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'education_cycle_id', referencedColumnName: 'id' }
  })
  educationCycles!: EducationCycle[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Propriedades computadas
  school_name?: string;
  student_count?: number;
  teacher_count?: number;
}