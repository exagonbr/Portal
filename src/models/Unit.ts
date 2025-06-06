import { Model } from 'objection';
import { Institution } from './Institution';

export class Unit extends Model {
  static tableName = 'units';

  id!: string;
  name!: string;
  description?: string;
  type!: string;
  active!: boolean;
  institution_id!: string;
  created_at!: Date;
  updated_at!: Date;

  institution?: Institution;

  static relationMappings = {
    institution: {
      relation: Model.BelongsToOneRelation,
      modelClass: Institution,
      join: {
        from: 'units.institution_id',
        to: 'institutions.id'
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