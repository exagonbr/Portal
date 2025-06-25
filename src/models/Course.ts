import { Model } from 'objection';
import { Institution } from './Institution';
import { Class } from './Class';

export class Course extends Model {
  static tableName = 'courses';

  id!: string;
  name!: string;
  description?: string;
  level!: string;
  type!: string;
  active!: boolean;
  institution_id!: string;
  created_at!: Date;
  updated_at!: Date;

  institution?: Institution;
  classes?: Class[];

  static relationMappings = {
    institution: {
      relation: Model.BelongsToOneRelation,
      modelClass: Institution,
      join: {
        from: 'courses.institution_id',
        to: 'institution.id'
      }
    },
    classes: {
      relation: Model.HasManyRelation,
      modelClass: Class,
      join: {
        from: 'courses.id',
        to: 'classes.course_id'
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