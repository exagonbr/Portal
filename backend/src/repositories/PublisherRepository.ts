import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Publisher } from '../entities/Publisher';

export interface CreatePublisherData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdatePublisherData extends Partial<CreatePublisherData> {}

export class PublisherRepository extends ExtendedRepository<Publisher> {
  constructor() {
    super('publisher');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Publisher>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('publisher');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('publisher.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('publisher.id', 'DESC')
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
          SELECT * FROM publisher
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM publisher
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
      console.error(`Erro ao buscar registros de publisher:`, error);
      throw error;
    }
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