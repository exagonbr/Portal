import { BaseRepository } from './BaseRepository';
import { User, CreateUserData, UpdateUserData, UserWithoutPassword } from '../models/User';
import db from '../config/database';

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';

  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as Partial<User>);
  }

  async findByInstitution(institutionId: string): Promise<User[]> {
    return this.findAll({ institution_id: institutionId } as Partial<User>);
  }

  async findByRole(roleId: string): Promise<User[]> {
    return this.findAll({ role_id: roleId } as Partial<User>);
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

  async findUserWithoutPassword(id: string): Promise<UserWithoutPassword | null> {
    const user = await db(this.tableName)
      .where('id', id)
      .select('id', 'email', 'full_name as name', 'username', 'phone', 'address', 'enabled as is_active', 'institution_id', 'date_created as created_at', 'last_updated as updated_at')
      .first();
    
    return user || null;
  }

  async findUsersWithoutPassword(filters?: Partial<User>): Promise<UserWithoutPassword[]> {
    let query = db(this.tableName)
      .select('id', 'email', 'full_name as name', 'username', 'phone', 'address', 'enabled as is_active', 'institution_id', 'date_created as created_at', 'last_updated as updated_at');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          // Mapear campos do modelo para campos reais da tabela
          const fieldMapping: { [key: string]: string } = {
            'name': 'full_name',
            'is_active': 'enabled',
            'created_at': 'date_created',
            'updated_at': 'last_updated',
            'telefone': 'phone',
            'endereco': 'address'
          };
          const realField = fieldMapping[key] || key;
          query = query.where(realField, value);
        }
      });
    }

    return query;
  }

  async searchUsers(searchTerm: string, institutionId?: string): Promise<UserWithoutPassword[]> {
    let query = db(this.tableName)
      .select('id', 'email', 'full_name as name', 'username', 'phone', 'address', 'enabled as is_active', 'institution_id', 'date_created as created_at', 'last_updated as updated_at')
      .where('full_name', 'ilike', `%${searchTerm}%`)
      .orWhere('email', 'ilike', `%${searchTerm}%`)
      .orWhere('username', 'ilike', `%${searchTerm}%`);

    if (institutionId) {
      query = query.where('institution_id', institutionId);
    }

    return query;
  }

  async getUsersWithRoleAndInstitution(): Promise<any[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.id`,
        `${this.tableName}.email`,
        `${this.tableName}.full_name as name`,
        `${this.tableName}.username`,
        `${this.tableName}.phone`,
        `${this.tableName}.address`,
        `${this.tableName}.institution_id`,
        `${this.tableName}.enabled as is_active`,
        'r.name as role_name',
        'i.name as institution_name'
      )
      .leftJoin('user_roles as ur', 'ur.user_id', `${this.tableName}.id`)
      .leftJoin('roles as r', 'r.id', 'ur.role_id')
      .leftJoin('institutions as i', 'i.id', `${this.tableName}.institution_id`)
      .where(`${this.tableName}.enabled`, true)
      .whereNot(`${this.tableName}.deleted`, true);
  }

  async getUserWithRoleAndInstitution(id: string): Promise<any | null> {
    const user = await db(this.tableName)
      .select(
        `${this.tableName}.*`,
        'r.name as role_name',
        'i.name as institution_name'
      )
      .leftJoin('user_roles as ur', 'ur.user_id', `${this.tableName}.id`)
      .leftJoin('roles as r', 'r.id', 'ur.role_id')
      .leftJoin('institutions as i', 'i.id', `${this.tableName}.institution_id`)
      .where(`${this.tableName}.id`, id)
      .whereNot(`${this.tableName}.deleted`, true)
      .first();

    return user || null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db(this.tableName)
      .where('id', id)
      .update({ last_login: db.fn.now() });
  }

  async getUserCourses(userId: string): Promise<any[]> {
    // Get courses where user is a student
    const studentCourses = await db('course_students')
      .select(
        'courses.*',
        'course_students.progress',
        'course_students.grades',
        'course_students.enrolled_at',
        db.raw("'student' as user_role")
      )
      .leftJoin('courses', 'course_students.course_id', 'courses.id')
      .where('course_students.user_id', userId);

    // Get courses where user is a teacher
    const teacherCourses = await db('course_teachers')
      .select(
        'courses.*',
        db.raw('NULL as progress'),
        db.raw('NULL as grades'),
        'course_teachers.assigned_at as enrolled_at',
        db.raw("'teacher' as user_role")
      )
      .leftJoin('courses', 'course_teachers.course_id', 'courses.id')
      .where('course_teachers.user_id', userId);

    return [...studentCourses, ...teacherCourses];
  }

  async getUserStatsByRole(): Promise<Record<string, number>> {
    try {
      const result = await db('roles as r')
        .select('r.name')
        .count('ur.user_id as count')
        .leftJoin('user_roles as ur', 'ur.role_id', 'r.id')
        .leftJoin('users as u', 'u.id', 'ur.user_id')
        .where('u.enabled', true)
        .whereNot('u.deleted', true)
        .groupBy('r.name');

      const stats: Record<string, number> = {};
      result.forEach((row: any) => {
        stats[row.name] = parseInt(row.count, 10) || 0;
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
        .select('i.name')
        .count(`${this.tableName}.id as count`)
        .leftJoin('institutions as i', 'i.id', `${this.tableName}.institution_id`)
        .where(`${this.tableName}.enabled`, true)
        .whereNot(`${this.tableName}.deleted`, true)
        .groupBy('i.name');

      const stats: Record<string, number> = {};
      result.forEach((row: any) => {
        stats[row.name || 'Sem Instituição'] = parseInt(row.count, 10) || 0;
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
}

  async getRecentLogins(limit: number = 10): Promise<any[]> {
    return db(this.tableName)
      .select(
        `${this.tableName}.id`,
        `${this.tableName}.name`,
        `${this.tableName}.email`,
        `${this.tableName}.last_login`,
        'r.name as role_name'
      )
      .leftJoin('roles as r', 'r.id', `${this.tableName}.role_id`)
      .whereNotNull(`${this.tableName}.last_login`)
      .orderBy(`${this.tableName}.last_login`, 'desc')
      .limit(limit);
  }
}
