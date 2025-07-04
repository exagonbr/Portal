import { BaseRepository } from './BaseRepository';
import { Users, CreateUsersData, UpdateUsersData, UsersFilterData, UsersListResult } from '../models/Users';
import db from '../config/database';

export class UsersRepository extends BaseRepository<Users> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.findOne({ email } as Partial<Users>);
  }

  async findByUsername(username: string): Promise<Users | null> {
    return this.findOne({ username } as Partial<Users>);
  }

  async createUser(data: CreateUsersData): Promise<Users> {
    // A lógica de hash de senha deve estar no serviço ou na própria entidade
    return this.create(data);
  }

  async updateUser(id: number, data: UpdateUsersData): Promise<Users | null> {
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
      .leftJoin('roles', 'users.roleId', 'roles.id')
      .leftJoin('institutions', 'users.institutionId', 'institutions.id')
      .select(
        'users.*',
        'roles.name as role_name',
        'institutions.name as institution_name'
      );

    const countQuery = this.db(this.tableName).count('id as total').first();

    if (search) {
      query.where(builder => {
        builder
          .where('users.fullName', 'ilike', `%${search}%`)
          .orWhere('users.email', 'ilike', `%${search}%`);
      });
      (countQuery as any).where(builder => {
        builder
          .where('users.fullName', 'ilike', `%${search}%`)
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