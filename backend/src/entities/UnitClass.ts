import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Institution } from './Institution';
import { Unit } from './Unit';

@Entity('unit_class')
export class UnitClass {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'date_created', type: 'datetime', nullable: true })
  dateCreated?: Date;

  @Column({ type: 'boolean', default: false })
  deleted!: boolean;

  @Column({ name: 'institution_id', type: 'bigint' })
  institutionId!: number;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution!: Institution;

  @Column({ name: 'last_updated', type: 'datetime', nullable: true })
  lastUpdated?: Date;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'unit_id', type: 'bigint' })
  unitId!: number;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit!: Unit;

  @Column({ name: 'institution_name', type: 'varchar', length: 255, nullable: true })
  institutionName?: string;

  @Column({ name: 'unit_name', type: 'varchar', length: 255, nullable: true })
  unitName?: string;
}