import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Institution } from './Institution';

@Entity('unit')
export class Unit {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'date_created', type: 'timestamp', nullable: true })
  dateCreated?: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ name: 'institution_id', type: 'bigint' })
  institutionId!: number;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution!: Institution;

  @Column({ name: 'last_updated', type: 'timestamp', nullable: true })
  lastUpdated?: Date;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'institution_name', type: 'varchar', length: 255, nullable: true })
  institutionName?: string;
}