import { Model } from 'objection';
import { User } from './User';
import { School } from './School';

export enum ManagerPosition {
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  COORDINATOR = 'COORDINATOR',
  SUPERVISOR = 'SUPERVISOR'
}

export class SchoolManager extends Model {
  static tableName = 'school_managers';

  id!: string;
  user_id!: string;
  school_id!: string;
  position!: ManagerPosition;
  start_date!: Date;
  end_date?: Date;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  user?: User;
  school?: School;

  static relationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'school_managers.user_id',
        to: 'user.id'
      }
    },
    school: {
      relation: Model.BelongsToOneRelation,
      modelClass: School,
      join: {
        from: 'school_managers.school_id',
        to: 'schools.id'
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