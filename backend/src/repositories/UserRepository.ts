import { BaseRepository } from './BaseRepository';
import { User, CreateUserData, UpdateUserData, UserWithoutPassword } from '../models/User';

export class UserRepository extends BaseRepository<User> {
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
    const user = await this.db(this.tableName)
      .where('id', id)
      .select('id', 'email', 'name', 'role_id', 'institution_id', 'endereco', 'telefone', 'school_id', 'is_active', 'created_at', 'updated_at')
      .first();
    
    return user || null;
  }

  async findUsersWithoutPassword(filters?: Partial<User>): Promise<UserWithoutPassword[]> {
    let query = this.db(this.tableName)
      .select('id', 'email', 'name', 'role_id', 'institution_id', 'endereco', 'telefone', 'school_id', 'is_active', 'created_at', 'updated_at');

    if (filters) {
      query = query.where(filters);
    }

    return query;
  }

  async searchUsers(searchTerm: string, institutionId?: string): Promise<UserWithoutPassword[]> {
    let query = this.db(this.tableName)
      .select('id', 'email', 'name', 'role_id', 'institution_id', 'endereco', 'telefone', 'school_id', 'is_active', 'created_at', 'updated_at')
      .where('name', 'ilike', `%${searchTerm}%`)
      .orWhere('email', 'ilike', `%${searchTerm}%`);

    if (institutionId) {
      query = query.andWhere('institution_id', institutionId);
    }

    return query;
  }

  async getUsersWithRoleAndInstitution(): Promise<any[]> {
    return this.db(this.tableName)
      .select(
        `${this.tableName}.id`,
        `${this.tableName}.email`,
        `${this.tableName}.name`,
        `${this.tableName}.role_id`,
        `${this.tableName}.institution_id`,
        `${this.tableName}.endereco`,
        `${this.tableName}.telefone`,
        `${this.tableName}.school_id`,
        `${this.tableName}.is_active`,
        `${this.tableName}.created_at`,
        `${this.tableName}.updated_at`,
        'roles.name as role_name',
        'institutions.name as institution_name',
        'schools.name as school_name'
      )
      .leftJoin('roles', `${this.tableName}.role_id`, 'roles.id')
      .leftJoin('institutions', `${this.tableName}.institution_id`, 'institutions.id')
      .leftJoin('schools', `${this.tableName}.school_id`, 'schools.id');
  }

  async getUserWithRoleAndInstitution(id: string): Promise<User | null> {
    const result = await this.db(this.tableName)
      .select(
        `${this.tableName}.id`,
        `${this.tableName}.email`,
        `${this.tableName}.name`,
        `${this.tableName}.role_id`,
        `${this.tableName}.institution_id`,
        `${this.tableName}.endereco`,
        `${this.tableName}.telefone`,
        `${this.tableName}.school_id`,
        `${this.tableName}.is_active`,
        `${this.tableName}.created_at`,
        `${this.tableName}.updated_at`,
        'roles.name as role_name',
        'institutions.name as institution_name',
        'schools.name as school_name'
      )
      .leftJoin('roles', `${this.tableName}.role_id`, 'roles.id')
      .leftJoin('institutions', `${this.tableName}.institution_id`, 'institutions.id')
      .leftJoin('schools', `${this.tableName}.school_id`, 'schools.id')
      .where(`${this.tableName}.id`, id)
      .first();

    return result || null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db(this.tableName)
      .where('id', id)
      .update({ last_login: new Date() });
  }

  async getUserCourses(userId: string): Promise<any[]> {
    // Get courses where user is a student
    const studentCourses = await this.db('course_students')
      .select(
        'courses.*',
        'course_students.progress',
        'course_students.grades',
        'course_students.enrolled_at',
        this.db.raw("'student' as user_role")
      )
      .leftJoin('courses', 'course_students.course_id', 'courses.id')
      .where('course_students.user_id', userId);

    // Get courses where user is a teacher
    const teacherCourses = await this.db('course_teachers')
      .select(
        'courses.*',
        this.db.raw('NULL as progress'),
        this.db.raw('NULL as grades'),
        'course_teachers.assigned_at as enrolled_at',
        this.db.raw("'teacher' as user_role")
      )
      .leftJoin('courses', 'course_teachers.course_id', 'courses.id')
      .where('course_teachers.user_id', userId);

    // Combine both results
    return [...studentCourses, ...teacherCourses];
  }
}
