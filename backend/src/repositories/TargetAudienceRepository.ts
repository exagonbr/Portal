import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { TargetAudience } from '../entities/TargetAudience';

export interface CreateTargetAudienceData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateTargetAudienceData extends Partial<CreateTargetAudienceData> {}

export class TargetAudienceRepository extends ExtendedRepository<TargetAudience> {
  constructor() {
    super('target_audience');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<TargetAudience>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('targetaudience');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('targetaudience.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('targetaudience.id', 'DESC')
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
          SELECT * FROM targetaudience
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM targetaudience
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
      console.error(`Erro ao buscar registros de targetaudience:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<TargetAudience | null> {
    const targetAudience = await this.findById(id);
    if (!targetAudience) return null;
    
    return this.update(id, { isActive: !targetAudience.isActive });
  }

  async findByName(name: string): Promise<TargetAudience[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<TargetAudience[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
} 