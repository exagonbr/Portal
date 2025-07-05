import { BaseRepository } from './BaseRepository';
import { Tag } from '../entities/Tag';

export interface CreateTagData {
  name: string;
  deleted?: boolean;
}

export interface UpdateTagData extends Partial<CreateTagData> {}

export class TagRepository extends BaseRepository<Tag> {
  constructor() {
    super('tag');
  }

  async findByName(name: string): Promise<Tag[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<Tag[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByExactName(name: string): Promise<Tag | null> {
    return this.db(this.tableName)
      .where('name', name)
      .andWhere('deleted', false)
      .first();
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.update(id, { deleted: true });
    return !!result;
  }
} 