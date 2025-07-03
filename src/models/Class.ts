import { Model } from 'objection';
import { Course } from './Course';
import { User } from './User';

export class Class extends Model {
  static tableName = 'classes';

  id!: string;
  name!: string;
  description?: string;
  status!: string;
  active!: boolean;
  course_id!: string;
  teacher_id!: string;
  created_at!: Date;
  updated_at!: Date;

  course?: Course;
  teacher?: User;
  students?: User[];

  static relationMappings = {
    course: {
      relation: Model.BelongsToOneRelation,
      modelClass: Course,
      join: {
        from: 'classes.course_id',
        to: 'courses.id'
      }
    },
    teacher: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'classes.teacher_id',
        to: 'users.id'
      }
    },
    students: {
      relation: Model.ManyToManyRelation,
      modelClass: User,
      join: {
        from: 'classes.id',
        through: {
          from: 'class_students.class_id',
          to: 'class_students.student_id'
        },
        to: 'users.id'
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