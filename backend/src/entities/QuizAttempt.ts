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
import { User } from './User';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column()
  quiz_id!: number;

  @ManyToOne(() => Quiz)
  @JoinColumn({ name: 'quiz_id' })
  quiz!: Quiz;

  @Column()
  user_id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: ['started', 'in_progress', 'completed', 'abandoned'], default: 'started' })
  status!: string;

  @Column({ type: 'int', nullable: true })
  score?: number;

  @Column({ type: 'jsonb', nullable: true })
  answers?: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  completed_at?: Date;

  @Column({ type: 'int', default: 1 })
  attempt_number!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
} 