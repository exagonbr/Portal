import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { User } from '../entities/User';
import db from '../config/database';

// Definindo interfaces locais para evitar erros de import
export interface CreateUsersData {
  email: string;
  fullName: string;
  password?: string;
  institutionId?: number;
  roleId?: number;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
}

export interface UpdateUsersData extends Partial<CreateUsersData> {}

export interface UsersFilterData {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  institutionId?: number;
  roleId?: number;
  isActive?: boolean;
}

export interface UsersListResult {
  items: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class UsersRepository extends BaseRepository<User> {
  private repository: Repository<Users>;
  constructor() {
    this.repository = AppDataSource.getRepository(Users);
    super('users'); // Corrigindo o nome da tabela para users (plural)
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Users>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('users');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('users.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('users.id', 'DESC')
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
          SELECT * FROM users
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM users
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
      console.error(`Erro ao buscar registros de users:`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as Partial<User>);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username } as Partial<User>);
  }

  async createUser(data: CreateUsersData): Promise<User> {
    // A lógica de hash de senha deve estar no serviço ou na própria entidade
    return this.create(data);
  }

  async updateUser(id: number, data: UpdateUsersData): Promise<User | null> {
    return this.update(id, data);
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.delete(id);
  }

  async getUsers(filters: UsersFilterData = {}): Promise<UsersListResult> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'fullName',
      sortOrder = 'asc',
      search,
      ...otherFilters
    } = filters;

    const query = this.db(this.tableName)
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .leftJoin('institution', 'users.institution_id', 'institution.id')
      .select(
        'users.*',
        'roles.name as role_name',
        'institution.name as institution_name'
      );

    const countQuery = this.db(this.tableName).count('id as total').first();

    if (search) {
      query.where((builder: any) => {
        builder
          .where('users.full_name', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`);
      });
      (countQuery as any).where((builder: any) => {
        builder
          .where('users.full_name', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`);
      });
    }

    if (Object.keys(otherFilters).length > 0) {
        query.where(otherFilters);
        (countQuery as any).where(otherFilters);
    }

    query.orderBy(`users.${sortBy}`, sortOrder).limit(limit).offset((page - 1) * limit);

    const [items, totalResult] = await Promise.all([query, countQuery]);
    
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}