import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from 'typeorm';
import { User } from './User';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  authority?: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName?: string;

  // Relacionamentos
  @OneToMany(() => User, user => user.role)
  users!: User[];
}