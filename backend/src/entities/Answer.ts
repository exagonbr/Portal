import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Question } from './Question';

@Entity('answer')
export class Answer {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @CreateDateColumn({ name: 'date_created' })
  dateCreated!: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ name: 'is_correct', type: 'boolean', nullable: true })
  isCorrect?: boolean;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated!: Date;

  @Column({ name: 'question_id', type: 'bigint', nullable: true })
  questionId?: number;

  @Column({ type: 'text', nullable: true })
  reply?: string;

  // Relacionamentos
  @ManyToOne(() => Question, question => question.answers)
  @JoinColumn({ name: 'question_id' })
  question?: Question;
}