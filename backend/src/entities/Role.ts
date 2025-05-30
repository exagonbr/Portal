import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { User } from './User';

export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  INSTITUTION_MANAGER = 'INSTITUTION_MANAGER',
  ACADEMIC_COORDINATOR = 'ACADEMIC_COORDINATOR',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    unique: true
  })
  name: UserRole;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Métodos auxiliares para verificar permissões
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  // Permissões padrão por role
  static getDefaultPermissions(role: UserRole): string[] {
    const permissionMap: Record<UserRole, string[]> = {
      [UserRole.SYSTEM_ADMIN]: [
        'system.manage',
        'institutions.manage',
        'users.manage.global',
        'analytics.view.system',
        'security.manage',
        'schools.manage',
        'users.manage.institution',
        'classes.manage',
        'schedules.manage',
        'analytics.view.institution',
        'cycles.manage',
        'curriculum.manage',
        'teachers.monitor',
        'analytics.view.academic',
        'departments.coordinate'
      ],
      [UserRole.INSTITUTION_MANAGER]: [
        'schools.manage',
        'users.manage.institution',
        'classes.manage',
        'schedules.manage',
        'analytics.view.institution',
        'cycles.manage',
        'curriculum.manage',
        'teachers.monitor',
        'analytics.view.academic',
        'departments.coordinate',
        'students.communicate',
        'guardians.communicate',
        'announcements.receive'
      ],
      [UserRole.ACADEMIC_COORDINATOR]: [
        'classes.manage',
        'schedules.manage',
        'analytics.view.institution',
        'cycles.manage',
        'curriculum.manage',
        'teachers.monitor',
        'analytics.view.academic',
        'departments.coordinate',
        'resources.upload',
        'students.communicate',
        'guardians.communicate',
        'teachers.message',
        'announcements.receive'
      ],
      [UserRole.TEACHER]: [
        'attendance.manage',
        'grades.manage',
        'lessons.manage',
        'resources.upload',
        'students.communicate',
        'guardians.communicate',
        'schedule.view.own',
        'materials.access',
        'teachers.message',
        'announcements.receive',
        'school.communicate'
      ],
      [UserRole.STUDENT]: [
        'students.communicate',
        'schedule.view.own',
        'grades.view.own',
        'materials.access',
        'assignments.submit',
        'progress.track.own',
        'teachers.message',
        'announcements.receive'
      ],
      [UserRole.GUARDIAN]: [
        'children.view.info',
        'children.view.grades',
        'children.view.attendance',
        'announcements.receive',
        'school.communicate'
      ]
    };

    return permissionMap[role] || [];
  }
}