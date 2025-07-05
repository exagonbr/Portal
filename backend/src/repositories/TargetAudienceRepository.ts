import { BaseRepository } from './BaseRepository';
import { TargetAudience } from '../entities/TargetAudience';

export interface CreateTargetAudienceData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateTargetAudienceData extends Partial<CreateTargetAudienceData> {}

export class TargetAudienceRepository extends BaseRepository<TargetAudience> {
  constructor() {
    super('target_audience');
  }

  async toggleStatus(id: string): Promise<TargetAudience | null> {
    const targetAudience = await this.findById(id);
    if (!targetAudience) return null;
    
    return this.update(id, { isActive: !targetAudience.isActive });
  }

  async findByName(name: string): Promise<TargetAudience[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<TargetAudience[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
} 