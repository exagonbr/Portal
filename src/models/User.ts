import { Model } from 'objection';
import { Role } from './Role';
import { Institution } from './Institution';
import { UserClass } from './UserClass';
import { SchoolManager } from './SchoolManager';
import { Course } from './Course';

export class User extends Model {
  static tableName = 'user';

  id!: number;
  googleId?: string;
  version?: number;
  accountExpired?: boolean;
  accountLocked?: boolean;
  address?: string;
  amountOfMediaEntries?: number;
  dateCreated!: Date;
  deleted?: boolean;
  email!: string;
  enabled?: boolean;
  fullName!: string;
  invitationSent?: boolean;
  isAdmin!: boolean;
  language?: string;
  lastUpdated!: Date;
  password?: string;
  passwordExpired?: boolean;
  pauseVideoOnClick?: boolean;
  phone?: string;
  resetPassword!: boolean;
  username?: string;
  uuid?: string;
  isManager!: boolean;
  type?: number;
  certificatePath?: string;
  isCertified?: boolean;
  isStudent!: boolean;
  isTeacher!: boolean;
  institutionId?: number;
  subject?: string;
  subjectDataId?: number;
  roleId?: number;

  role?: Role;
  institution?: Institution;
  userClasses?: UserClass[];
  schoolManagers?: SchoolManager[];
  teachingCourses?: Course[];

  static relationMappings = {
    role: {
      relation: Model.BelongsToOneRelation,
      modelClass: Role,
      join: {
        from: 'user.roleId',
        to: 'role.id'
      }
    },
    institution: {
      relation: Model.BelongsToOneRelation,
      modelClass: Institution,
      join: {
        from: 'user.institutionId',
        to: 'institution.id'
      }
    },
    userClasses: {
        relation: Model.HasManyRelation,
        modelClass: UserClass,
        join: {
            from: 'user.id',
            to: 'user_classes.user_id'
        }
    },
    schoolManagers: {
        relation: Model.HasManyRelation,
        modelClass: SchoolManager,
        join: {
            from: 'user.id',
            to: 'school_managers.user_id'
        }
    },
    teachingCourses: {
        relation: Model.HasManyRelation,
        modelClass: Course,
        join: {
            from: 'user.id',
            to: 'courses.teacher_id'
        }
    }
  };

  $beforeInsert() {
    this.dateCreated = new Date();
    this.lastUpdated = new Date();
  }

  $beforeUpdate() {
    this.lastUpdated = new Date();
  }
}