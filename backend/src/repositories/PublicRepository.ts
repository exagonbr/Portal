import { BaseRepository } from './BaseRepository';
import { Public } from '../entities/Public';

export interface CreatePublicData {
  name: string;
  apiId: number;
}

export interface UpdatePublicData extends Partial<CreatePublicData> {}

export class PublicRepository extends BaseRepository<Public> {
  constructor() {
    super('public');
  }

  async findByName(name: string): Promise<Public[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findByApiId(apiId: number): Promise<Public | null> {
    return this.db(this.tableName)
      .where('api_id', apiId)
      .first();
  }
} 