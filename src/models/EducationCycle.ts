import { Model } from 'objection';
import { Class } from './Class';

export enum EducationLevel {
  EDUCACAO_INFANTIL = 'EDUCACAO_INFANTIL',
  ENSINO_FUNDAMENTAL_I = 'ENSINO_FUNDAMENTAL_I',
  ENSINO_FUNDAMENTAL_II = 'ENSINO_FUNDAMENTAL_II',
  ENSINO_MEDIO = 'ENSINO_MEDIO',
  ENSINO_TECNICO = 'ENSINO_TECNICO',
  ENSINO_SUPERIOR = 'ENSINO_SUPERIOR'
}

export class EducationCycle extends Model {
  static tableName = 'education_cycles';

  id!: string;
  name!: string;
  level!: EducationLevel;
  description?: string;
  duration_years!: number;
  min_age?: number;
  max_age?: number;
  created_at!: Date;
  updated_at!: Date;

  classes?: Class[];

  static relationMappings = {
    classes: {
      relation: Model.ManyToManyRelation,
      modelClass: Class,
      join: {
        from: 'education_cycles.id',
        through: {
          from: 'class_education_cycles.education_cycle_id',
          to: 'class_education_cycles.class_id'
        },
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