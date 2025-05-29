import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Question } from './Question';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', nullable: true })
  time_limit?: number;

  @Column({ type: 'int' })
  passing_score: number;

  @Column({ type: 'int', default: 1 })
  attempts: number;

  @Column({ default: true })
  is_graded: boolean;

  @OneToMany(() => Question, question => question.quiz)
  questions: Question[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}