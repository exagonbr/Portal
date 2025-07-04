import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('teacher_subject')
export class TeacherSubject {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'is_child', type: 'boolean', nullable: true })
  isChild?: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', nullable: true })
  isDeleted?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  uuid?: string;
}