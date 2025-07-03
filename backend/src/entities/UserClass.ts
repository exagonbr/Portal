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
import { Class } from './Class';

export enum UserClassRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  COORDINATOR = 'COORDINATOR'
}

@Entity('user_classes')
export class UserClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  class_id: string;

  @ManyToOne(() => Class, classEntity => classEntity.userClasses)
  @JoinColumn({ name: 'class_id' })
  class: Class;

  @ManyToOne(() => User, user => user.userClasses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: UserClassRole
  })
  role: UserClassRole;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  enrollment_date: Date;

  @Column({ type: 'date', nullable: true })
  exit_date?: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Propriedades computadas
  user_name?: string;
  user_email?: string;
  class_name?: string;
  class_code?: string;
  school_name?: string;
  school_id?: string;
}
