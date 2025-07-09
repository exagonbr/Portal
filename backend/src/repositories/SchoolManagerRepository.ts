import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { SchoolManager, ManagerPosition } from '../entities/SchoolManager';

export interface CreateSchoolManagerData extends Omit<SchoolManager, 'id' | 'created_at' | 'updated_at' | 'user' | 'school' | 'user_name' | 'user_email' | 'school_name' | 'school_code' | 'institution_name' | 'institution_id'> {}
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

  constructor() {
    super("schoolmanagers");
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
  }

  async findByUserAndSchool(userId: number, schoolId: number): Promise<SchoolManager[]> {
    return this.findAll({ user_id: userId, school_id: schoolId } as Partial<SchoolManager>);
  }

  async findActiveBySchool(schoolId: number): Promise<SchoolManager[]> {
    return this.findAll({ school_id: schoolId, is_active: true } as Partial<SchoolManager>);
  }

  async findActiveByUser(userId: number): Promise<SchoolManager[]> {
    return this.findAll({ user_id: userId, is_active: true } as Partial<SchoolManager>);
  }
  
  async findByPosition(schoolId: number, position: ManagerPosition): Promise<SchoolManager[]> {
    return this.findAll({ school_id: schoolId, position: position } as Partial<SchoolManager>);
  }

  async findWithFilters(filters: SchoolManagerFilters): Promise<{ data: SchoolManager[], total: number }> {
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
  }
}
