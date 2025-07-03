import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  Index
} from 'typeorm';
import bcrypt from 'bcryptjs';
import { Role } from './Role';
import { Institution } from './Institution';
import { UserClass } from './UserClass';
import { SchoolManager } from './SchoolManager';
import { Course } from './Course';
import { ChatMessage } from './ChatMessage';
import { ForumThread } from './ForumThread';
import { ForumReply } from './ForumReply';
import { Notification } from './Notification';

@Entity('users')
@Index('idx_users_email', ['email'])
@Index('idx_users_username_unique', ['username'], { unique: true })
export class Users {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'bigint', nullable: true })
  version?: number;

  @Column({ type: 'boolean', nullable: true, name: 'account_expired' })
  accountExpired?: boolean;

  @Column({ type: 'boolean', nullable: true, name: 'account_locked' })
  accountLocked?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'int', nullable: true, name: 'amount_of_media_entries' })
  amountOfMediaEntries?: number;

  @CreateDateColumn({ name: 'date_created' })
  dateCreated: Date;

  @Column({ type: 'boolean', nullable: true })
  deleted?: boolean;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'boolean', nullable: true })
  enabled?: boolean;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'boolean', nullable: true, name: 'invitation_sent' })
  invitationSent?: boolean;

  @Column({ type: 'boolean', name: 'is_admin' })
  isAdmin: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  language?: string;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string;

  @Column({ type: 'boolean', nullable: true, name: 'password_expired' })
  passwordExpired?: boolean;

  @Column({ type: 'boolean', nullable: true, name: 'pause_video_on_click' })
  pauseVideoOnClick?: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone?: string;

  @Column({ type: 'boolean', default: true, name: 'reset_password' })
  resetPassword: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  username?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  uuid?: string;

  @Column({ type: 'boolean', name: 'is_manager' })
  isManager: boolean;

  @Column({ type: 'int', nullable: true })
  type?: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'certificate_path' })
  certificatePath?: string;

  @Column({ type: 'boolean', default: false, nullable: true, name: 'is_certified' })
  isCertified?: boolean;

  @Column({ type: 'boolean', name: 'is_student' })
  isStudent: boolean;

  @Column({ type: 'boolean', name: 'is_teacher' })
  isTeacher: boolean;

  @Column({ type: 'bigint', nullable: true, name: 'institution_id' })
  institutionId?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject?: string;

  @Column({ type: 'bigint', nullable: true, name: 'subject_data_id' })
  subjectDataId?: number;

  @Column({ type: 'boolean', default: false, nullable: true, name: 'is_institution_manage' })
  isInstitutionManage?: boolean;

  @Column({ type: 'boolean', default: false, nullable: true, name: 'is_coordinator' })
  isCoordinator?: boolean;

  @Column({ type: 'boolean', default: false, nullable: true, name: 'is_guardian' })
  isGuardian?: boolean;

  @Column({ type: 'boolean', default: false, nullable: true, name: 'is_institution_manager' })
  isInstitutionManager?: boolean;

  @Column({ type: 'uuid', nullable: true, name: 'role_id' })
  roleId?: string;

  @Column({ type: 'varchar', nullable: true, unique: true, name: 'googleId' })
  googleId?: string;

  // Relacionamentos
  @ManyToOne(() => Role, role => role.users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @ManyToOne(() => Institution, institution => institution.users, { nullable: true })
  @JoinColumn({ name: 'institution_id' })
  institution?: Institution;

  @OneToMany(() => UserClass, userClass => userClass.user)
  userClasses: UserClass[];

  @OneToMany(() => SchoolManager, schoolManager => schoolManager.user)
  schoolManagers: SchoolManager[];

  @OneToMany(() => Course, course => course.teacher)
  teachingCourses: Course[];

  @OneToMany(() => ChatMessage, message => message.sender)
  sentMessages: ChatMessage[];

  @OneToMany(() => ForumThread, thread => thread.author)
  forumThreads: ForumThread[];

  @OneToMany(() => ForumReply, reply => reply.author)
  forumReplies: ForumReply[];

  @OneToMany(() => Notification, notification => notification.sentBy)
  sentNotifications: Notification[];

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

  // Método para remover senha do objeto
  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}