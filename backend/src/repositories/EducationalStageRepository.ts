import { BaseRepository } from './BaseRepository';
import { EducationalStage } from '../entities/EducationalStage';

export interface CreateEducationalStageData {
  name: string;
  uuid?: string;
  grade1?: boolean;
  grade2?: boolean;
  grade3?: boolean;
  grade4?: boolean;
  grade5?: boolean;
  grade6?: boolean;
  grade7?: boolean;
  grade8?: boolean;
  grade9?: boolean;
  deleted?: boolean;
}

export interface UpdateEducationalStageData extends Partial<CreateEducationalStageData> {}

export class EducationalStageRepository extends BaseRepository<EducationalStage> {
  constructor() {
    super('educational_stage');
  }

  async findByName(name: string): Promise<EducationalStage[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<EducationalStage[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByGrade(grade: number): Promise<EducationalStage[]> {
    const gradeColumn = `grade_${grade}`;
    return this.db(this.tableName)
      .where(gradeColumn, true)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByUuid(uuid: string): Promise<EducationalStage | null> {
    return this.db(this.tableName)
      .where('uuid', uuid)
      .andWhere('deleted', false)
      .first();
  }
} 