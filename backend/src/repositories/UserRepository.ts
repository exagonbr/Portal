import { BaseRepository } from './BaseRepository';
import { User } from '../entities/User';
import * as bcrypt from 'bcryptjs';

// Interfaces para desacoplar da entidade
export interface CreateUserData extends Omit<User, 'id' | 'comparePassword' | 'hashPassword' | 'toJSON' | 'userClasses' | 'schoolManagers' | 'teachingCourses' | 'sentMessages' | 'forumThreads' | 'forumReplies' | 'sentNotifications' | 'dateCreated' | 'lastUpdated'> {
  password?: string;
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, 'password'>> {
  password?: string; // Senha é opcional na atualização
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as Partial<User>);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ username } as Partial<User>);
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.findOne({ googleId } as Partial<User>);
  }

  async createUser(data: CreateUserData): Promise<User> {
    if (data.password) {
      const salt = await bcrypt.genSalt(12);
      data.password = await bcrypt.hash(data.password, salt);
    }
    return this.create(data);
  }

  async updateUser(id: number, data: UpdateUserData): Promise<User | null> {
    if (data.password) {
      const salt = await bcrypt.genSalt(12);
      data.password = await bcrypt.hash(data.password, salt);
    }
    return this.update(id, data);
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.delete(id);
  }

  async findByIdWithRelations(id: number): Promise<User | null> {
    const user = await this.db(this.tableName)
      .where({ [`${this.tableName}.id`]: id })
      .leftJoin('roles', `${this.tableName}.role_id`, 'roles.id')
      .leftJoin('institution', `${this.tableName}.institution_id`, 'institution.id')
      .select(
        `${this.tableName}.*`,
        'roles.name as roleName',
        'institution.name as institutionName'
      )
      .first();

    if (!user) return null;

    const { roleName, institutionName, ...userProps } = user;
    
    return {
      ...userProps,
      role: { name: roleName },
      institution: { name: institutionName },
    } as User;
  }

  async search(term: string, limit: number = 20): Promise<User[]> {
    return this.db(this.tableName)
      .where('full_name', 'ilike', `%${term}%`)
      .orWhere('email', 'ilike', `%${term}%`)
      .orWhere('username', 'ilike', `%${term}%`)
      .limit(limit);
  }

  async findByRole(roleId: number): Promise<User[]> {
    return this.findAll({ role_id: roleId } as Partial<User>);
  }

  async findByInstitution(institutionId: number): Promise<User[]> {
    return this.findAll({ institution_id: institutionId } as Partial<User>);
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.update(id, { lastUpdated: new Date() } as Partial<User>);
  }
}