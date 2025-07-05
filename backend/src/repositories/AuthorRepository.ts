import { BaseRepository } from './BaseRepository';
import { Author } from '../entities/Author';

export interface CreateAuthorData {
  name: string;
  description: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateAuthorData extends Partial<CreateAuthorData> {}

export class AuthorRepository extends BaseRepository<Author> {
  constructor() {
    super('author');
  }

  async toggleStatus(id: string): Promise<Author | null> {
    const author = await this.findById(id);
    if (!author) return null;
    
    const updatedAuthor = await this.update(id, { isActive: !author.isActive });
    return updatedAuthor;
  }

  async findByName(name: string): Promise<Author[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('is_active', true);
  }

  async findActive(): Promise<Author[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
}