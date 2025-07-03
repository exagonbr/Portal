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
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column({ name: 'full_name' })
  name: string;

  @Column({ name: 'enabled', default: true })
  is_active: boolean;

  @Column({ default: '35f57500-9a89-4318-bc9f-9acad28c2fb6' })
  role_id: string;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  institution_id?: string;

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
}

export interface UserWithRelations {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  role?: Role;
  institution?: Institution;
  userClasses?: UserClass[];
  schoolManagers?: SchoolManager[];
  teachingCourses?: Course[];
  sentMessages?: ChatMessage[];
  forumThreads?: ForumThread[];
  forumReplies?: ForumReply[];
  sentNotifications?: Notification[];
}
