import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { EducationPeriod } from '../entities/EducationPeriod';

export interface CreateEducationPeriodData {
  description: string;
  isActive?: boolean;
}

export interface UpdateEducationPeriodData extends Partial<CreateEducationPeriodData> {}

export class EducationPeriodRepository extends ExtendedRepository<EducationPeriod> {
  constructor() {
    super('education_period');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<EducationPeriod>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('educationperiod');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('educationperiod.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('educationperiod.id', 'DESC')
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
          SELECT * FROM educationperiod
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM educationperiod
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
      console.error(`Erro ao buscar registros de educationperiod:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<EducationPeriod | null> {
    const educationPeriod = await this.findById(id);
    if (!educationPeriod) return null;
    
    return this.update(id, { isActive: !educationPeriod.isActive });
  }

  async findByDescription(description: string): Promise<EducationPeriod[]> {
    return this.db(this.tableName)
      .where('description', 'ilike', `%${description}%`)
      .orderBy('description', 'asc');
  }

  async findActive(): Promise<EducationPeriod[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('description', 'asc');
  }
} 