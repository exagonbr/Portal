import { BaseRepository } from './BaseRepository';
import { User, CreateUserData, UpdateUserData } from '../models/User';
import db from '../config/database';

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';

  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as Partial<User>);
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.create(data);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
    return this.update(id, data);
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.delete(id);
  }


  async findById(id: string): Promise<User | null> {
    const user = await this.db(this.tableName)
      .where(`${this.tableName}.id`, id)
      .leftJoin('roles', `${this.tableName}.role_id`, 'roles.id')
      .select(
        `${this.tableName}.*`,
        'roles.name as roleName',
        'roles.permissions as rolePermissions'
      )
      .first();

    if (!user) {
      return null;
    }

    // Remodelar o objeto para aninhar a role
    const { roleName, rolePermissions, ...userProps } = user;
    return {
      ...userProps,
      role: {
        id: user.role_id,
        name: roleName,
        permissions: rolePermissions,
      },
    } as unknown as User;
  }

  async getUserWithRoleAndInstitution(id: string): Promise<any | null> {
    // Este método agora se beneficia do findById sobrescrito
    return this.findById(id);
  }

  async getUserStatsByRole(): Promise<Record<string, number>> {
    try {
      // This query assumes a 'role_id' on the users table and a 'roles' table
      const result = await db('users')
        .select('role_id')
        .count('id as count')
        .groupBy('role_id');

      const stats: Record<string, number> = {};
      result.forEach((row: any) => {
        stats[row.role_id || 'UNKNOWN'] = parseInt(row.count, 10) || 0;
      });
      return stats;
    } catch (error) {
      console.error('Error fetching user stats by role:', error);
      return {};
    }
  }

  async getUserStatsByInstitution(): Promise<Record<string, number>> {
    try {
      const result = await db(this.tableName)
        .select('institution_id')
        .count('id as count')
        .groupBy('institution_id');

      const stats: Record<string, number> = {};
      result.forEach((row: any) => {
        stats[row.institution_id || 'UNKNOWN'] = parseInt(row.count, 10) || 0;
      });
      return stats;
    } catch (error) {
      console.error('Error fetching user stats by institution:', error);
      return {};
    }
  }

  async countNewThisMonth(): Promise<number> {
    const firstDayOfMonth = new Date(new Date().setDate(1));
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const result = await db(this.tableName)
      .where('created_at', '>=', firstDayOfMonth)
      .count('id as count')
      .first();
      
    return parseInt(String(result?.count || '0'), 10);
  }
}
