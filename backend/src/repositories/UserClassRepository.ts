import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { UserClass, UserClassRole } from '../entities/UserClass';

export interface CreateUserClassData extends Omit<UserClass, 'id' | 'created_at' | 'updated_at' | 'user' | 'class' | 'user_name' | 'user_email' | 'class_name' | 'class_code' | 'school_name' | 'school_id'> {}
export interface UpdateUserClassData extends Partial<CreateUserClassData> {}

export interface UserClassFilters {
  user_id?: number;
  class_id?: number;
  role?: UserClassRole;
  is_active?: boolean;
  school_id?: number;
  year?: number;
  page?: number;
  limit?: number;
  sortBy?: keyof UserClass;
  sortOrder?: 'asc' | 'desc';
}

export class UserClassRepository extends ExtendedRepository<UserClass> {

  constructor() {
    super("userclasss");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<UserClass>> {
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

  async findByUserAndClass(userId: number, classId: number): Promise<UserClass | null> {
    return this.findOne({ user_id: userId, class_id: classId } as Partial<UserClass>);
  }

  async findActiveByUser(userId: number): Promise<UserClass[]> {
    return this.findAll({ user_id: userId, is_active: true } as Partial<UserClass>);
  }

  async findActiveByClass(classId: number): Promise<UserClass[]> {
    return this.findAll({ class_id: classId, is_active: true } as Partial<UserClass>);
  }

  async findByRole(classId: number, role: UserClassRole): Promise<UserClass[]> {
    return this.findAll({ class_id: classId, role: role } as Partial<UserClass>);
  }

  async findWithFilters(filters: UserClassFilters): Promise<{ data: UserClass[], total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'enrollment_date',
      sortOrder = 'desc',
      school_id,
      year,
      ...otherFilters
    } = filters;

    let query = this.db(this.tableName).select('user_classes.*');
    let countQuery = this.db(this.tableName).count('* as total').first();

    if (school_id || year) {
        query.join('classes', 'user_classes.class_id', 'classes.id');
        (countQuery as any).join('classes', 'user_classes.class_id', 'classes.id'); // Cast para evitar erro de tipo
        if(school_id) {
            query.where('classes.school_id', school_id);
            (countQuery as any).where('classes.school_id', school_id);
        }
        if(year) {
            query.where('classes.year', year);
            (countQuery as any).where('classes.year', year);
        }
    }

    if (Object.keys(otherFilters).length > 0) {
        query.where(otherFilters);
        (countQuery as any).where(otherFilters);
    }
    
    query.orderBy(`user_classes.${sortBy}`, sortOrder).limit(limit).offset((page - 1) * limit);

    const [data, totalResult] = await Promise.all([query, countQuery]);
    
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    return { data, total };
  }
}
