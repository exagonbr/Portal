import { Model } from 'objection';
import { Institution } from './Institution';
import { Class } from './Class';

export class School extends Model {
  static tableName = 'schools';

  id!: number;
  version?: number;
  dateCreated?: Date;
  deleted?: boolean;
  institutionId!: number;
  lastUpdated?: Date;
  name!: string;
  institutionName?: string;

  institution?: Institution;
  classes?: Class[];

  static relationMappings = {
    institution: {
      relation: Model.BelongsToOneRelation,
      modelClass: Institution,
      join: {
        from: 'schools.institutionId',
        to: 'institution.id'
      }
    },
    classes: {
      relation: Model.HasManyRelation,
      modelClass: Class,
      join: {
        from: 'schools.id',
        to: 'classes.school_id'
      }
    }
  };
}