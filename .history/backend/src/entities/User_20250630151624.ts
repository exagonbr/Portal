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
  BeforeUpdate
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
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password?: string;

  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  cpf?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  birth_date?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  zip_code?: string;

  @Column({ nullable: true })
  endereco?: string;

  @Column({ nullable: true })
  telefone?: string;

  @Column({ nullable: true })
  usuario?: string;

  @Column({ nullable: true })
  unidade_ensino?: string;

  @Column({ default: true })
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Métodos para hash de senha
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Método para remover senha do objeto
  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}