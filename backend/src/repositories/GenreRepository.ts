import { BaseRepository } from './BaseRepository';
import { Genre } from '../entities/Genre';

export interface CreateGenreData {
  name: string;
  apiId: number;
}

export interface UpdateGenreData extends Partial<CreateGenreData> {}

export class GenreRepository extends BaseRepository<Genre> {
  constructor() {
    super('genre');
  }

  async findByName(name: string): Promise<Genre[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findByApiId(apiId: number): Promise<Genre | null> {
    return this.db(this.tableName)
      .where('api_id', apiId)
      .first();
  }
} 