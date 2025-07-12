import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
// Comentando a importação da entidade SchoolManager para evitar erros
// import { SchoolManager, ManagerPosition } from '../entities/SchoolManager';

// Definindo o enum ManagerPosition
export enum ManagerPosition {
  DIRECTOR = 'director',
  COORDINATOR = 'coordinator',
  SUPERVISOR = 'supervisor',
  ASSISTANT = 'assistant'
}

// Interface para desacoplar
export interface SchoolManager {
    id: string;
    user_id: number;
    school_id: number;
    position: ManagerPosition;
    start_date: Date;
    end_date?: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    // Campos virtuais
    user_name?: string;
    user_email?: string;
    school_name?: string;
    school_code?: string;
    institution_name?: string;
    institution_id?: number;
}

export interface CreateSchoolManagerData extends Omit<SchoolManager, 'id' | 'created_at' | 'updated_at' | 'user_name' | 'user_email' | 'school_name' | 'school_code' | 'institution_name' | 'institution_id'> {}
export interface UpdateSchoolManagerData extends Partial<CreateSchoolManagerData> {}

export interface SchoolManagerFilters {
  user_id?: number;
  school_id?: number;
  position?: ManagerPosition;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: keyof SchoolManager;
  sortOrder?: 'asc' | 'desc';
}

export class SchoolManagerRepository extends ExtendedRepository<SchoolManager> {
  // Removendo a propriedade repository já que não estamos usando TypeORM diretamente

  constructor() {
    super("schoolmanagers");
    // Estamos usando Knex através da classe base, não TypeORM
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<SchoolManager>> {
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
      throw error;
    }
  }

  async findByUserAndSchool(userId: number, schoolId: number): Promise<SchoolManager[]> {
    try {
      return this.findAll({ user_id: userId, school_id: schoolId } as Partial<SchoolManager>);
    } catch (error) {
      throw error;
    }
  }

  async findActiveBySchool(schoolId: number): Promise<SchoolManager[]> {
    try {
      return this.findAll({ school_id: schoolId, is_active: true } as Partial<SchoolManager>);
    } catch (error) {
      throw error;
    }
  }

  async findActiveByUser(userId: number): Promise<SchoolManager[]> {
    try {
      return this.findAll({ user_id: userId, is_active: true } as Partial<SchoolManager>);
    } catch (error) {
      throw error;
    }
  }
  
  async findByPosition(schoolId: number, position: ManagerPosition): Promise<SchoolManager[]> {
    try {
      return this.findAll({ school_id: schoolId, position: position } as Partial<SchoolManager>);
    } catch (error) {
      throw error;
    }
  }

  async findWithFilters(filters: SchoolManagerFilters): Promise<{ data: SchoolManager[], total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'start_date',
        sortOrder = 'desc',
        ...otherFilters
      } = filters;

      const query = this.db(this.tableName).select('*');
      const countQuery = this.db(this.tableName).count('* as total').first();

      if (Object.keys(otherFilters).length > 0) {
          query.where(otherFilters);
          countQuery.where(otherFilters);
      }
      
      query.orderBy(sortBy, sortOrder).limit(limit).offset((page - 1) * limit);

      const [data, totalResult] = await Promise.all([query, countQuery]);
      
      const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

      return { data, total };
    } catch (error) {
      throw error;
    }
  }
}
