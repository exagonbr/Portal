import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
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
    super('school_managers');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<SchoolManager>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('schoolmanager');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('schoolmanager.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('schoolmanager.id', 'DESC')
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
          SELECT * FROM schoolmanager
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM schoolmanager
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
      console.error(`Erro ao buscar registros de schoolmanager:`, error);
      throw error;
    }
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