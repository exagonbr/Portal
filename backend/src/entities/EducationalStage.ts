import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('educational_stage')
export class EducationalStage {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'date_created', type: 'datetime', nullable: true })
  dateCreated?: Date;

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  @Column({ name: 'grade_1', type: 'boolean', nullable: true })
  grade1?: boolean;

  @Column({ name: 'grade_2', type: 'boolean', nullable: true })
  grade2?: boolean;

  @Column({ name: 'grade_3', type: 'boolean', nullable: true })
  grade3?: boolean;

  @Column({ name: 'grade_4', type: 'boolean', nullable: true })
  grade4?: boolean;

  @Column({ name: 'grade_5', type: 'boolean', nullable: true })
  grade5?: boolean;

  @Column({ name: 'grade_6', type: 'boolean', nullable: true })
  grade6?: boolean;

  @Column({ name: 'grade_7', type: 'boolean', nullable: true })
  grade7?: boolean;

  @Column({ name: 'grade_8', type: 'boolean', nullable: true })
  grade8?: boolean;

  @Column({ name: 'grade_9', type: 'boolean', nullable: true })
  grade9?: boolean;

  @Column({ name: 'last_updated', type: 'datetime', nullable: true })
  lastUpdated?: Date;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  uuid?: string;
}