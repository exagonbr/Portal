import { BaseRepository } from './BaseRepository';
import { Language } from '../entities/Language';

export interface CreateLanguageData {
  name: string;
  code: string;
  isActive?: boolean;
}

export interface UpdateLanguageData extends Partial<CreateLanguageData> {}

export class LanguageRepository extends BaseRepository<Language> {
  constructor() {
    super('language');
  }

  async toggleStatus(id: string): Promise<Language | null> {
    const language = await this.findById(id);
    if (!language) return null;
    
    return this.update(id, { isActive: !language.isActive });
  }

  async findByCode(code: string): Promise<Language | null> {
    return this.db(this.tableName)
      .where('code', code)
      .first();
  }

  async findActive(): Promise<Language[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }

  async findByName(name: string): Promise<Language[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }
} 