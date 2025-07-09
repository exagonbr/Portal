import { Repository } from "typeorm";
import { Institution } from '../entities';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { PaginationOptions } from '../types/pagination';

// Interface para desacoplar
export interface Course {
    id: string;
    name: string;
    description: string;
    institution_id: string;
    teacher_id?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface InstitutionFilters {
  search?: string;
  state?: string;
  is_active?: boolean;
  has_student_platform?: boolean;
  has_principal_platform?: boolean;
  has_library_platform?: boolean;
}

export class InstitutionRepository extends ExtendedRepository<Institution> {
  constructor() {
    super("institution");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Institution>> {
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
      console.error(`Erro ao buscar registros de institution:`, error);
      throw error;
    }
  }

  async findWithFilters(
    filters: InstitutionFilters,
    options: PaginationOptions
  ): Promise<{ items: Institution[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    
    // Início da medição de tempo para debug
    const startTime = Date.now();
    
    try {
      // Otimização 1: Selecionar apenas os campos necessários
      const selectFields = [
        'id', 'name', 'company_name', 'document', 'state', 
        'city', 'deleted', 'has_student_platform', 
        'has_principal_platform', 'has_library_platform'
      ];
      
      // Construir a consulta base
      const query = this.db(this.tableName)
        .select(selectFields)
        .where((builder) => {
          if (filters.search) {
            builder.where('name', 'ilike', `%${filters.search}%`)
              .orWhere('company_name', 'ilike', `%${filters.search}%`)
              .orWhere('document', 'ilike', `%${filters.search}%`);
          }
          
          if (filters.state) {
            builder.where('state', '=', filters.state);
          }
          
          if (filters.is_active !== undefined) {
            builder.where('deleted', '=', !filters.is_active);
          }
          
          if (filters.has_student_platform !== undefined) {
            builder.where('has_student_platform', '=', filters.has_student_platform);
          }
          
          if (filters.has_principal_platform !== undefined) {
            builder.where('has_principal_platform', '=', filters.has_principal_platform);
          }
          
          if (filters.has_library_platform !== undefined) {
            builder.where('has_library_platform', '=', filters.has_library_platform);
          }
        });

      // Otimização 2: Fazer duas consultas separadas (total e itens)
      // para evitar problemas de desempenho em grandes conjuntos de dados
      const countQuery = query.clone().count('id as count').first();
      
      const itemsQuery = query.clone()
        .orderBy('name', 'asc')
        .offset((page - 1) * limit)
        .limit(limit);
      
      // Executar as duas consultas em paralelo
      const [total, items] = await Promise.all([
        countQuery,
        itemsQuery
      ]);
      
      // Log de desempenho
      const endTime = Date.now();
      console.log(`Consulta de instituições concluída em ${endTime - startTime}ms`);
      
      return {
        items: items as Institution[],
        total: total ? Number(total.count) : 0
      };
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Institution | null> {
    const institution = await this.findById(id);
    if (!institution) return null;
    return this.update(id, { deleted: !institution.deleted } as Partial<Institution>);
  }

  async getStats(id: string): Promise<any> {
    // Obter estatísticas da instituição
    const stats = await this.db
      .select(
        this.db.raw(`
          (SELECT COUNT(*) FROM "user" WHERE institution_id = ?) as total_users,
          (SELECT COUNT(*) FROM "class" WHERE institution_id = ?) as total_classes,
          (SELECT COUNT(*) FROM "schedule" WHERE institution_id = ?) as total_schedules
        `, [id, id, id])
      )
      .first();
      
    return stats;
  }

  async getUsers(id: string, options: PaginationOptions): Promise<{ items: any[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    
    const total = await this.db('user')
      .where('institution_id', id)
      .count('id as count')
      .first();
      
    const items = await this.db('user')
      .where('institution_id', id)
      .orderBy('name', 'asc')
      .offset((page - 1) * limit)
      .limit(limit)
      .select('*');
      
    return {
      items,
      total: total ? Number(total.count) : 0
    };
  }

  async getClasses(id: string, options: PaginationOptions): Promise<{ items: any[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    
    const total = await this.db('class')
      .where('institution_id', id)
      .count('id as count')
      .first();
      
    const items = await this.db('class')
      .where('institution_id', id)
      .orderBy('name', 'asc')
      .offset((page - 1) * limit)
      .limit(limit)
      .select('*');
      
    return {
      items,
      total: total ? Number(total.count) : 0
    };
  }

  async getSchedules(id: string, options: PaginationOptions): Promise<{ items: any[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    
    const total = await this.db('schedule')
      .where('institution_id', id)
      .count('id as count')
      .first();
      
    const items = await this.db('schedule')
      .where('institution_id', id)
      .orderBy('created_at', 'desc')
      .offset((page - 1) * limit)
      .limit(limit)
      .select('*');
      
    return {
      items,
      total: total ? Number(total.count) : 0
    };
  }

  async getAnalytics(id: string): Promise<any> {
    // Obter dados analíticos da instituição
    const analytics = await this.db
      .select(
        this.db.raw(`
          (SELECT COUNT(*) FROM "user" WHERE institution_id = ? AND role = 'student') as student_count,
          (SELECT COUNT(*) FROM "user" WHERE institution_id = ? AND role = 'teacher') as teacher_count,
          (SELECT COUNT(*) FROM "class" WHERE institution_id = ? AND active = true) as active_classes,
          (SELECT COUNT(*) FROM "schedule" WHERE institution_id = ? AND date >= CURRENT_DATE) as upcoming_schedules
        `, [id, id, id, id])
      )
      .first();
      
    return analytics;
  }
}