import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Public } from '../entities/Public';

export interface CreatePublicData {
  name: string;
  apiId: number;
}

export interface UpdatePublicData extends Partial<CreatePublicData> {}

export class PublicRepository extends ExtendedRepository<Public> {
  constructor() {
    super('public');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Public>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('public');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('public.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('public.id', 'DESC')
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
          SELECT * FROM public
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM public
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
      console.error(`Erro ao buscar registros de public:`, error);
      throw error;
    }
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