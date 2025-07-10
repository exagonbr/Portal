import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from './UserRole.enum';
import { UserRoleMapping } from './UserRoleMapping';

@Entity('users')
export class User {
  [x: string]: any;
  
  @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true, unique: true })
  googleId?: string;

  @Column({ name: 'profile_image', type: 'varchar', length: 500, nullable: true })
  profileImage?: string;

  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified?: boolean;

  @Column({ type: 'boolean', nullable: true })
  enabled?: boolean;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  // Alias para compatibilidade
  get name(): string {
    return this.fullName;
  }

  set name(value: string) {
    this.fullName = value;
  }

  @Column({ name: 'is_admin', type: 'boolean' })
  isAdmin!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  username?: string;

  @Column({ name: 'is_manager', type: 'boolean' })
  isManager!: boolean;

  @Column({ name: 'is_student', type: 'boolean' })
  isStudent!: boolean;

  @Column({ name: 'is_teacher', type: 'boolean' })
  isTeacher!: boolean;

  @Column({ name: 'institution_id', type: 'bigint', nullable: true })
  institutionId?: number;

  // Alias para compatibilidade
  get institution_id(): number | null | undefined {
    return this.institutionId;
  }

  set institution_id(value: number | null | undefined) {
    this.institutionId = value ?? undefined;
  }

  @Column({ name: 'subject_data_id', type: 'bigint', nullable: true })
  subjectDataId?: number;

  // Relacionamento com UserRoleMapping
  @OneToMany(() => UserRoleMapping, mapping => mapping.user)
  roleMappings?: UserRoleMapping[];

  // Métodos para hash de senha
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password.length > 0 && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(password, this.password);
  }

  hasValidRole(): boolean {
    return this.roleMappings !== undefined && this.roleMappings.length > 0;
  }

  determineRoleFromFlags(): UserRole {
    if (this.isAdmin) {
      return UserRole.SYSTEM_ADMIN;
    }
    if (this.isManager) {
      return UserRole.INSTITUTION_MANAGER;
    }
    if (this.isTeacher) {
      return UserRole.TEACHER;
    }
    if (this.isStudent) {
      return UserRole.STUDENT;
    }
    return UserRole.GUEST;
  }

  // Método para remover senha do objeto
  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}