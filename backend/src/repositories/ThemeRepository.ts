import { BaseRepository } from './BaseRepository';
import { Theme } from '../entities/Theme';

export interface CreateThemeData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateThemeData extends Partial<CreateThemeData> {}

export class ThemeRepository extends BaseRepository<Theme> {
  constructor() {
    super('theme');
  }

  async toggleStatus(id: string): Promise<Theme | null> {
    const theme = await this.findById(id);
    if (!theme) return null;
    
    return this.update(id, { isActive: !theme.isActive });
  }

  async findByName(name: string): Promise<Theme[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<Theme[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
} 