import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';
import { Role } from './Role';

@Entity('user_role')
export class UserRoleMapping {
  @PrimaryColumn({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @PrimaryColumn({ name: 'role_id', type: 'bigint' })
  roleId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role!: Role;
}