import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('answer')
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  version?: string;

  @Column({ nullable: true })
  dateCreated?: string;

  @Column({ nullable: true })
  deleted?: string;

  @Column({ nullable: true })
  isCorrect?: string;

  @Column({ nullable: true })
  lastUpdated?: string;

  @Column({ nullable: true })
  questionId?: string;

  @Column({ nullable: true })
  reply?: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question?: Question;

}