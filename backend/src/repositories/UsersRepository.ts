import { BaseRepository } from './BaseRepository';
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
  constructor() {
    super('user'); // Corrigindo o nome da tabela
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
      .leftJoin('role', 'user.role_id', 'role.id')
      .leftJoin('institution', 'user.institution_id', 'institution.id')
      .select(
        'user.*',
        'role.name as role_name',
        'institution.name as institution_name'
      );

    const countQuery = this.db(this.tableName).count('id as total').first();

    if (search) {
      query.where((builder: any) => {
        builder
          .where('user.full_name', 'ilike', `%${search}%`)
          .orWhere('user.email', 'ilike', `%${search}%`);
      });
      (countQuery as any).where((builder: any) => {
        builder
          .where('user.full_name', 'ilike', `%${search}%`)
          .orWhere('user.email', 'ilike', `%${search}%`);
      });
    }

    if (Object.keys(otherFilters).length > 0) {
        query.where(otherFilters);
        (countQuery as any).where(otherFilters);
    }

    query.orderBy(`user.${sortBy}`, sortOrder).limit(limit).offset((page - 1) * limit);

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