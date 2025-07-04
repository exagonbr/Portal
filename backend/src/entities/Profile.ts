import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('profile')
export class Profile {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'avatar_color', type: 'varchar', length: 255, nullable: true })
  avatarColor?: string;

  @Column({ name: 'is_child', type: 'boolean', nullable: true })
  isChild?: boolean;

  @Column({ name: 'is_deleted', type: 'boolean', nullable: true })
  isDeleted?: boolean;

  @Column({ name: 'profile_language', type: 'varchar', length: 255, nullable: true })
  profileLanguage?: string;

  @Column({ name: 'profile_name', type: 'varchar', length: 255, nullable: true })
  profileName?: string;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  userId?: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}