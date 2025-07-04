import { Model } from 'objection';
import { Institution } from './Institution';

export class Unit extends Model {
  static tableName = 'unit';

  id!: number;
  version?: number;
  dateCreated?: Date;
  deleted?: boolean;
  institutionId!: number;
  lastUpdated?: Date;
  name!: string;
  institutionName?: string;

  institution?: Institution;

  static relationMappings = {
    institution: {
      relation: Model.BelongsToOneRelation,
      modelClass: Institution,
      join: {
        from: 'unit.institutionId',
        to: 'institution.id'
      }
    }
  };
}