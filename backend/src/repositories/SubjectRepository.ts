import { BaseRepository } from './BaseRepository';
import { Subject } from '../entities/Subject';

export interface CreateSubjectData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}

export class SubjectRepository extends BaseRepository<Subject> {
  constructor() {
    super('subject');
  }

  async toggleStatus(id: string): Promise<Subject | null> {
    const subject = await this.findById(id);
    if (!subject) return null;
    
    return this.update(id, { isActive: !subject.isActive });
  }

  async findByName(name: string): Promise<Subject[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<Subject[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
} 