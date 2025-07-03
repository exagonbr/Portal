import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable
} from 'typeorm';
import { User } from './User';
import { Institution } from './Institution';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  institution_id: string;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ nullable: true })
  level?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ nullable: true })
  teacher_id?: string;

  @ManyToOne(() => User, user => user.teachingCourses, { nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher?: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'course_students',
    joinColumn: { name: 'course_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  students: User[];

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Propriedades computadas
  institution_name?: string;
  student_count?: number;
}