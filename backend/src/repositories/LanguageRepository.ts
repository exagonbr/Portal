import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Language } from '../entities/Language';
import { AppDataSource } from '../config/typeorm.config';
import { Repository } from 'typeorm';

export interface CreateLanguageData {
  name: string;
  code: string;
  isActive?: boolean;
}

export interface UpdateLanguageData extends Partial<CreateLanguageData> {}

export class LanguageRepository extends ExtendedRepository<Language> {
  constructor() {
    super("languages");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Language>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select('*');
      
      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike('name', `%${search}%`);
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
            qb.whereILike('name', `%${search}%`);
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
      console.error(`Erro ao buscar registros de language:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Language | null> {
    const language = await this.findById(id);
    if (!language) return null;
    
    return this.update(id, { isActive: !language.isActive });
  }

  async findByCode(code: string): Promise<Language | null> {
    return this.db(this.tableName)
      .where('code', code)
      .first();
  }

  async findActive(): Promise<Language[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }

  async findByName(name: string): Promise<Language[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }
} 