import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  key?: string;

  @Column({ nullable: true })
  value?: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  isPublic?: string;

  @Column({ nullable: true })
  isEncrypted?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

}