import { BaseRepository } from './BaseRepository';
import { User, CreateUserData, UpdateUserData } from '../models/User';
import db from '../config/database';

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';

  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    console.log(`🔍 [UserRepository] Buscando usuário por email: ${email}`);
    
    const result = await this.db(this.tableName)
      .where({ email })
      .select('*')
      .first();
    
    if (!result) {
      console.log(`❌ [UserRepository] Usuário não encontrado: ${email}`);
      return null;
    }
    
    // Mapear enabled para is_active para compatibilidade
    const user = {
      ...result,
      is_active: result.enabled !== false // true se enabled for true ou null
    };
    
    console.log(`✅ [UserRepository] Usuário encontrado:`, {
      id: user.id,
      email: user.email,
      enabled: result.enabled,
      is_active: user.is_active,
      full_name: user.full_name
    });
    
    return user as User;
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
      .where({ [`${this.tableName}.id`]: id })
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

    const { roleName, rolePermissions, ...userProps } = user;
    
    // Mapear enabled para is_active para compatibilidade
    const mappedUser = {
      ...userProps,
      is_active: userProps.enabled !== false, // true se enabled for true ou null
      role: {
        id: user.role_id,
        name: roleName,
        permissions: rolePermissions,
      },
    };
    
    console.log(`✅ [UserRepository] findById - Usuário mapeado:`, {
      id: mappedUser.id,
      enabled: userProps.enabled,
      is_active: mappedUser.is_active
    });
    
    return mappedUser as unknown as User;
  }

  async getUserWithRoleAndInstitution(id: string): Promise<any | null> {
    return this.findById(id);
  }

  async searchUsers(searchTerm: string, institutionId?: string): Promise<User[]> {
    let query = this.db(this.tableName)
      .where('full_name', 'ilike', `%${searchTerm}%`)
      .orWhere('email', 'ilike', `%${searchTerm}%`);

    if (institutionId) {
      query = query.andWhere({ institution_id: institutionId });
    }

    return query.select('*');
  }

  async findByRole(role: string): Promise<User[]> {
    const roleResult = await this.db('roles').where({ name: role }).first();
    if (!roleResult) return [];
    return this.findAll({ role_id: roleResult.id });
  }

  async findByInstitution(institutionId: string): Promise<User[]> {
    return this.findAll({ institution_id: institutionId });
  }

  async getUserCourses(userId: string): Promise<any[]> {
    return this.db('user_classes')
      .where({ user_id: userId })
      .join('classes', 'user_classes.class_id', 'classes.id')
      .join('courses', 'classes.course_id', 'courses.id')
      .select('courses.*');
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.update(userId, { last_login: new Date() } as any);
  }

  async getUserStatsByRole(): Promise<Record<string, number>> {
    try {
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
      console.log('Error fetching user stats by role:', error);
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
      console.log('Error fetching user stats by institution:', error);
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
