import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Author } from '../entities/Author';

export interface CreateAuthorData {
  name: string;
  description: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateAuthorData extends Partial<CreateAuthorData> {}

export class AuthorRepository extends ExtendedRepository<Author> {
  constructor() {
    super('author');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Author>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('author');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('author.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('author.id', 'DESC')
          .getManyAndCount();
          
        return {
          data,
          total,
          page,
          limit
        };
      } else {
        // Fallback para query raw
        const query = `
          SELECT * FROM author
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM author
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
        `;

        const [data, countResult] = await Promise.all([
          AppDataSource.query(query),
          AppDataSource.query(countQuery)
        ]);

        const total = parseInt(countResult[0].total);

        return {
          data,
          total,
          page,
          limit
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar registros de author:`, error);
      throw error;
    }
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