import { EducationCycle } from "./EducationCycle";
import { Unit } from "./Unit";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('classes')
export class Classes {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  year?: string;

  @Column({ nullable: true })
  semester?: string;

  @Column({ nullable: true })
  maxStudents?: string;

  @Column({ nullable: true })
  currentStudents?: string;

  @Column({ nullable: true })
  unitId?: string;

  @Column({ nullable: true })
  educationCycleId?: string;

  @Column({ nullable: true })
  status?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit?: Unit;

  @ManyToOne(() => EducationCycle)
  @JoinColumn({ name: 'education_cycle_id' })
  educationCycle?: EducationCycle;

}