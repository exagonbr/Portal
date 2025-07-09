import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

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

  @ManyToOne(() => Permission)
  @JoinColumn({ name: 'permission_id' })
  permission?: Permission;

}