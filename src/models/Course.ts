import { Model } from 'objection';
import { Institution } from './Institution';
import { User } from './User';

export class Course extends Model {
  static tableName = 'courses';

  id!: string;
  name!: string;
  description?: string;
  institution_id!: string;
  level?: string;
  duration?: number;
  teacher_id?: string;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  institution?: Institution;
  teacher?: User;
  students?: User[];

  static relationMappings = {
    institution: {
      relation: Model.BelongsToOneRelation,
      modelClass: Institution,
      join: {
        from: 'courses.institution_id',
        to: 'institution.id'
      }
    },
    teacher: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'courses.teacher_id',
        to: 'user.id'
      }
    },
    students: {
      relation: Model.ManyToManyRelation,
      modelClass: User,
      join: {
        from: 'courses.id',
        through: {
          from: 'course_students.course_id',
          to: 'course_students.user_id'
        },
        to: 'user.id'
      }
    }
  };

  $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  $beforeUpdate() {
    this.updated_at = new Date();
  }
}