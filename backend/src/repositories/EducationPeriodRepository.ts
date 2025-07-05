import { BaseRepository } from './BaseRepository';
import { EducationPeriod } from '../entities/EducationPeriod';

export interface CreateEducationPeriodData {
  description: string;
  isActive?: boolean;
}

export interface UpdateEducationPeriodData extends Partial<CreateEducationPeriodData> {}

export class EducationPeriodRepository extends BaseRepository<EducationPeriod> {
  constructor() {
    super('education_period');
  }

  async toggleStatus(id: string): Promise<EducationPeriod | null> {
    const educationPeriod = await this.findById(id);
    if (!educationPeriod) return null;
    
    return this.update(id, { isActive: !educationPeriod.isActive });
  }

  async findByDescription(description: string): Promise<EducationPeriod[]> {
    return this.db(this.tableName)
      .where('description', 'ilike', `%${description}%`)
      .orderBy('description', 'asc');
  }

  async findActive(): Promise<EducationPeriod[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('description', 'asc');
  }
} 