import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './Role';
import { Permissions } from './Permissions';

@Entity('role_permissions')
export class RolePermissions {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  roleId?: string;

  @Column({ nullable: true })
  permissionId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @ManyToOne(() => Permissions)
  @JoinColumn({ name: 'permission_id' })
  permission?: Permissions;

}