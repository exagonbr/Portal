import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { TargetAudience } from '../entities/TargetAudience';

export interface CreateTargetAudienceData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateTargetAudienceData extends Partial<CreateTargetAudienceData> {}

export class TargetAudienceRepository extends ExtendedRepository<TargetAudience> {
  constructor() {
    super("targetaudiences");
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<TargetAudience>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select("*");

      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike("name", `%${search}%`);
      }

      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("id", "DESC")
        .limit(limit)
        .offset(offset);

      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify(qb => {
          if (search) {
            qb.whereILike("name", `%${search}%`);
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
      console.error(`Erro ao buscar registros de público-alvo:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<TargetAudience | null> {
    try {
      const targetAudience = await this.findById(id);
      if (!targetAudience) return null;
      
      return this.update(id, { isActive: !targetAudience.isActive });
    } catch (error) {
      console.error(`Erro ao alternar status do público-alvo:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<TargetAudience[]> {
    try {
      return this.db(this.tableName)
        .where('name', 'ilike', `%${name}%`)
        .orderBy('name', 'asc');
    } catch (error) {
      console.error(`Erro ao buscar público-alvo por nome:`, error);
      throw error;
    }
  }

  async findActive(): Promise<TargetAudience[]> {
    try {
      return this.db(this.tableName)
        .where('is_active', true)
        .orderBy('name', 'asc');
    } catch (error) {
      console.error(`Erro ao buscar público-alvo ativo:`, error);
      throw error;
    }
  }
} 
