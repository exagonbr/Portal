import {
  Entity,
  PrimaryGeneratedColumn,
  Column
} from 'typeorm';

@Entity('public')
export class Public {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'api_id', type: 'int' })
  apiId!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;
}