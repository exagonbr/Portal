import { Model } from 'objection';
import { Unit } from './Unit';
import { Course } from './Course';

export class Institution extends Model {
  static tableName = 'institutions';

  id!: string;
  name!: string;
  description?: string;
  type!: string;
  active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  units?: Unit[];
  courses?: Course[];

  static relationMappings = {
    units: {
      relation: Model.HasManyRelation,
      modelClass: Unit,
      join: {
        from: 'institution.id',
        to: 'units.institution_id'
      }
    },
    courses: {
      relation: Model.HasManyRelation,
      modelClass: Course,
      join: {
        from: 'institution.id',
        to: 'courses.institution_id'
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