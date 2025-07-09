import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { EducationPeriod } from '../entities/EducationPeriod';

export interface CreateEducationPeriodData {
  description: string;
  isActive?: boolean;
}

export interface UpdateEducationPeriodData extends Partial<CreateEducationPeriodData> {}

export class EducationPeriodRepository extends ExtendedRepository<EducationPeriod> {
  constructor() {
    super("educationperiods");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<EducationPeriod>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select('*');
      
      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike('description', `%${search}%`);
      }
      
      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy('id', 'DESC')
        .limit(limit)
        .offset(offset);
      
      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count('* as total')
        .modify(qb => {
          if (search) {
            qb.whereILike('description', `%${search}%`);
          }
        })
        .first();
      
      const total = parseInt(countResult?.total as string, 10) || 0;
      
      return {
        data,
        total,
        page,
        limit
      };
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