import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from './UserRole.enum';
import { Role } from './Role';

@Entity('users')
export class User {
  [x: string]: any;
  
  @Column({ name: 'google_id', type: 'varchar', length: 255, nullable: true, unique: true })
  googleId?: string;

  @Column({ name: 'profile_image', type: 'varchar', length: 500, nullable: true })
  profileImage?: string;

  @PrimaryGeneratedColumn('increment')
  id!: number;

  // @Column({ type: 'bigint', nullable: true })
  // version?: number;

  // @Column({ name: 'account_expired', type: 'boolean', nullable: true })
  // accountExpired?: boolean;

  // @Column({ name: 'account_locked', type: 'boolean', nullable: true })
  // accountLocked?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  // @Column({ name: 'amount_of_media_entries', type: 'int', nullable: true })
  // amountOfMediaEntries?: number;

  // @Column({ name: 'date_created', type: 'timestamp', nullable: true })
  // dateCreated?: Date;

  // @Column({ type: 'boolean', nullable: true })
  // deleted?: boolean;

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

  // @Column({ name: 'invitation_sent', type: 'boolean', nullable: true })
  // invitationSent?: boolean;

  @Column({ name: 'is_admin', type: 'boolean' })
  isAdmin!: boolean;

  // @Column({ type: 'varchar', length: 255, nullable: true })
  // language?: string;

  // @Column({ name: 'last_updated', type: 'timestamp', nullable: true })
  // lastUpdated?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  // @Column({ name: 'password_expired', type: 'boolean', nullable: true })
  // passwordExpired?: boolean;

  // @Column({ name: 'pause_video_on_click', type: 'boolean', nullable: true })
  // pauseVideoOnClick?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone?: string;

  // @Column({ name: 'reset_password', type: 'boolean', default: true })
  // resetPassword!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  username?: string;

  // @Column({ type: 'varchar', length: 255, nullable: true })
  // uuid?: string;

  @Column({ name: 'is_manager', type: 'boolean' })
  isManager!: boolean;

  // @Column({ type: 'int', nullable: true })
  // type?: number;

  // @Column({ name: 'certificate_path', type: 'varchar', length: 255, nullable: true })
  // certificatePath?: string;

  // @Column({ name: 'is_certified', type: 'boolean', default: false })
  // isCertified!: boolean;

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

  // @Column({ type: 'varchar', length: 255, nullable: true })
  // subject?: string;

  @Column({ name: 'subject_data_id', type: 'bigint', nullable: true })
  subjectDataId?: number;

  // Adicionando a coluna role_id que está faltando
  @Column({ name: 'role_id', type: 'bigint', nullable: true })
  roleId?: number;

  // Definindo a relação com a entidade Role
  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role?: Role;

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
    return !!this.roleId;
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