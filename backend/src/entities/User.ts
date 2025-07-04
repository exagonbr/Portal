import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRole } from './UserRole.enum';
import { Institution } from './Institution';
import { TeacherSubject } from './TeacherSubject';
import { Role } from './Role';
import { UserClass } from './UserClass';
import { SchoolManager } from './SchoolManager';
import { Course } from './Course';
import { ChatMessage } from './ChatMessage';
import { ForumThread } from './ForumThread';
import { ForumReply } from './ForumReply';
import { Notification } from './Notification';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ name: 'account_expired', type: 'boolean', nullable: true })
  accountExpired?: boolean;

  @Column({ name: 'account_locked', type: 'boolean', nullable: true })
  accountLocked?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ name: 'amount_of_media_entries', type: 'int', nullable: true })
  amountOfMediaEntries?: number;

  @Column({ name: 'date_created', type: 'timestamp', nullable: true })
  dateCreated?: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

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

  @Column({ name: 'invitation_sent', type: 'boolean', nullable: true })
  invitationSent?: boolean;

  @Column({ name: 'is_admin', type: 'boolean' })
  isAdmin!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  language?: string;

  @Column({ name: 'last_updated', type: 'timestamp', nullable: true })
  lastUpdated?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ name: 'password_expired', type: 'boolean', nullable: true })
  passwordExpired?: boolean;

  @Column({ name: 'pause_video_on_click', type: 'boolean', nullable: true })
  pauseVideoOnClick?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone?: string;

  @Column({ name: 'reset_password', type: 'boolean', default: true })
  resetPassword!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  username?: string;

  @Column({ name: 'is_manager', type: 'boolean' })
  isManager!: boolean;

  @Column({ type: 'int', nullable: true })
  type?: number;

  @Column({ name: 'certificate_path', type: 'varchar', length: 255, nullable: true })
  certificatePath?: string;

  @Column({ name: 'is_certified', type: 'boolean', default: false })
  isCertified!: boolean;

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

  @ManyToOne(() => Institution, institution => institution.users, { nullable: true })
  @JoinColumn({ name: 'institution_id' })
  institution?: Institution;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject?: string;

  @Column({ name: 'subject_data_id', type: 'bigint', nullable: true })
  subjectDataId?: number;

  @ManyToOne(() => TeacherSubject, { nullable: true })
  @JoinColumn({ name: 'subject_data_id' })
  subjectData?: TeacherSubject;

  // Coluna role_id para relacionamento direto com Role
  @Column({ name: 'role_id', type: 'bigint', nullable: true })
  roleId?: number;

  // Relacionamentos para compatibilidade com o código existente
  @ManyToOne(() => Role, role => role.users, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @OneToMany(() => UserClass, userClass => userClass.user)
  userClasses!: UserClass[];

  @OneToMany(() => SchoolManager, schoolManager => schoolManager.user)
  schoolManagers!: SchoolManager[];

  @OneToMany(() => Course, course => course.teacher)
  teachingCourses!: Course[];

  @OneToMany(() => ChatMessage, message => message.sender)
  sentMessages!: ChatMessage[];

  @OneToMany(() => ForumThread, thread => thread.author)
  forumThreads!: ForumThread[];

  @OneToMany(() => ForumReply, reply => reply.author)
  forumReplies!: ForumReply[];

  @OneToMany(() => Notification, notification => notification.sentBy)
  sentNotifications!: Notification[];

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
    return !!this.role;
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