import { BaseRepository } from './BaseRepository';
import { Publisher } from '../entities/Publisher';

export interface CreatePublisherData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdatePublisherData extends Partial<CreatePublisherData> {}

export class PublisherRepository extends BaseRepository<Publisher> {
  constructor() {
    super('publisher');
  }

  async toggleStatus(id: string): Promise<Publisher | null> {
    const publisher = await this.findById(id);
    if (!publisher) return null;
    
    return this.update(id, { isActive: !publisher.isActive });
  }

  async findByName(name: string): Promise<Publisher[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<Publisher[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
} 