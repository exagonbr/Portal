import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { User } from './User';
import { School } from './School';
import { TVShow } from './TVShow';
import { Course } from './Course';

export enum InstitutionType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  MIXED = 'MIXED'
}

@Entity('institution')
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: InstitutionType,
    default: InstitutionType.PUBLIC
  })
  type: InstitutionType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  zip_code?: string;

  @Column({ nullable: true })
  logo_url?: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => School, school => school.institution)
  schools: School[];

  @OneToMany(() => TVShow, tvShow => tvShow.institution)
  tvShows: TVShow[];

  @OneToMany(() => Course, course => course.institution)
  courses: Course[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => User, user => user.institution)
  users: User[];
  // Propriedades computadas

  schools_count?: number;
  users_count?: number;
  active_courses?: number;
}
