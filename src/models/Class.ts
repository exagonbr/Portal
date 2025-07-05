import { Model } from 'objection';
import { School } from './School';
import { UserClass } from './UserClass';
import { EducationCycle } from './EducationCycle';

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  FULL_TIME = 'FULL_TIME'
}

export class Class extends Model {
  static tableName = 'classes';

  id!: string;
  name!: string;
  code!: string;
  school_id!: string;
  year!: number;
  shift!: ShiftType;
  max_students!: number;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  school?: School;
  userClasses?: UserClass[];
  educationCycles?: EducationCycle[];

  static relationMappings = {
    school: {
      relation: Model.BelongsToOneRelation,
      modelClass: School,
      join: {
        from: 'classes.school_id',
        to: 'schools.id'
      }
    },
    userClasses: {
      relation: Model.HasManyRelation,
      modelClass: UserClass,
      join: {
        from: 'classes.id',
        to: 'user_classes.class_id'
      }
    },
    educationCycles: {
        relation: Model.ManyToManyRelation,
        modelClass: EducationCycle,
        join: {
          from: 'classes.id',
          through: {
            from: 'class_education_cycles.class_id',
            to: 'class_education_cycles.education_cycle_id'
          },
          to: 'education_cycles.id'
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