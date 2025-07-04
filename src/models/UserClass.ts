import { Model } from 'objection';
import { User } from './User';
import { Class } from './Class';

export enum UserClassRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  COORDINATOR = 'COORDINATOR'
}

export class UserClass extends Model {
  static tableName = 'user_classes';

  id!: string;
  user_id!: string;
  class_id!: string;
  role!: UserClassRole;
  enrollment_date!: Date;
  exit_date?: Date;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  user?: User;
  class?: Class;

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'user_classes.user_id',
        to: 'user.id'
      }
    },
    class: {
      relation: Model.BelongsToOneRelation,
      modelClass: Class,
      join: {
        from: 'user_classes.class_id',
        to: 'classes.id'
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