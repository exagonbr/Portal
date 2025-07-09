import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  isActive?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  version?: string;

}