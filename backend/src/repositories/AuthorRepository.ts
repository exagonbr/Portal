import { BaseRepository } from './BaseRepository';

// Interface para desacoplar
export interface Author {
    id: string;
    name: string;
    description?: string;
    email?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export class AuthorRepository extends BaseRepository<Author> {
  constructor() {
    super('authors');
  }

  async toggleStatus(id: string): Promise<Author | null> {
    const author = await this.findById(id);
    if (!author) return null;
    return this.update(id, { is_active: !author.is_active } as Partial<Author>);
  }
}