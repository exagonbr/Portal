import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Quiz } from './Quiz';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  quiz_id!: number;

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @Column()
  type!: string; // multiple-choice, true-false, short-answer

  @Column({ type: 'text' })
  text!: string;

  @Column({ type: 'jsonb', nullable: true })
  options?: string[];

  @Column({ type: 'jsonb' })
  correct_answer!: string | string[];

  @Column({ type: 'int' })
  points!: number;

  @Column({ type: 'text', nullable: true })
  explanation?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}