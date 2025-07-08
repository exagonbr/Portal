import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('education_cycles')
export class EducationCycles {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  minAge?: string;

  @Column({ nullable: true })
  maxAge?: string;

  @Column({ nullable: true })
  durationYears?: string;

  @Column({ nullable: true })
  institutionId?: string;

  @Column({ nullable: true })
  status?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution?: Institution;

}