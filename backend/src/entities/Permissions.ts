import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permissions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  resource?: string;

  @Column({ nullable: true })
  action?: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}