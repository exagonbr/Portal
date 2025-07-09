import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Class, ShiftType } from '../entities/Class';

export class ClassRepository extends ExtendedRepository<Class> {
  constructor() {
    super("classs");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Class>> {
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
      console.error(`Erro ao buscar registros de class:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string | number): Promise<Class | null> {
    const classData = await this.findById(id);
    if (!classData) return null;
    return this.update(id, { is_active: !classData.is_active } as Partial<Class>);
  }
}