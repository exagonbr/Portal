import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Answer } from './Answer';
import { Quiz } from './Quiz';

@Entity('question')
export class Question {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @CreateDateColumn({ name: 'date_created' })
  dateCreated!: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ name: 'file_id', type: 'bigint', nullable: true })
  fileId?: number;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated!: Date;

  @Column({ type: 'text', nullable: true })
  test?: string;

  @Column({ name: 'tv_show_id', type: 'bigint', nullable: true })
  tvShowId?: number;

  @Column({ name: 'episode_id', type: 'bigint', nullable: true })
  episodeId?: number;

  @Column({ name: 'quiz_id', type: 'int', nullable: true })
  quizId?: number;

  // Relacionamentos
  @ManyToOne(() => Quiz, quiz => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz?: Quiz;

  @OneToMany(() => Answer, answer => answer.question)
  answers?: Answer[];
}