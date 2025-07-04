import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'date_created', type: 'datetime' })
  dateCreated!: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ name: 'last_updated', type: 'datetime' })
  lastUpdated!: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  name?: string;
}