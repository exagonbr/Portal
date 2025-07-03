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

  @ManyToOne(() => Institution, institution => institution.courses)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ nullable: true })
  teacher_id?: string;

  @ManyToOne(() => User, user => user.teachingCourses)
  @JoinColumn({ name: 'teacher_id' })
  teacher?: User;

  @Column({ nullable: true })
  level?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

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
