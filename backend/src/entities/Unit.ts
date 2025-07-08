import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Institution } from './Institution';

@Entity('unit')
export class Unit {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @CreateDateColumn({ name: 'date_created', type: 'timestamp' })
  dateCreated!: Date;

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  @Column({ name: 'institution_id', type: 'bigint' })
  institutionId!: number;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution!: Institution;

  @UpdateDateColumn({ name: 'last_updated', type: 'timestamp' })
  lastUpdated!: Date;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'institution_name', type: 'varchar', length: 255, nullable: true })
  institutionName?: string;
}