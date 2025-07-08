import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Genre } from '../entities/Genre';

export interface CreateGenreData {
  name: string;
  apiId: number;
}

export interface UpdateGenreData extends Partial<CreateGenreData> {}

export class GenreRepository extends ExtendedRepository<Genre> {
  constructor() {
    super('genre');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Genre>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('genre');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('genre.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('genre.id', 'DESC')
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
          SELECT * FROM genre
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM genre
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
      console.error(`Erro ao buscar registros de genre:`, error);
      throw error;
    }
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