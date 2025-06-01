import db from '../config/database';
import bcrypt from 'bcryptjs';
import { User, CreateUserData, UpdateUserData, UserWithRelations } from '../entities/User';

export class UserRepository {
  private static readonly TABLE_NAME = 'users';

  static async findById(id: number): Promise<UserWithRelations | null> {
    try {
      const user = await db(this.TABLE_NAME)
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .leftJoin('institutions', 'users.institution_id', 'institutions.id')
        .select(
          'users.*',
          'roles.id as role_id',
          'roles.name as role_name',
          'institutions.id as institution_id',
          'institutions.name as institution_name'
        )
        .where('users.id', id)
        .first();

      if (!user) return null;

      return this.mapUserWithRelations(user);
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<UserWithRelations | null> {
    try {
      const user = await db(this.TABLE_NAME)
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .leftJoin('institutions', 'users.institution_id', 'institutions.id')
        .select(
          'users.*',
          'roles.id as role_id',
          'roles.name as role_name',
          'institutions.id as institution_id',
          'institutions.name as institution_name'
        )
        .where('users.email', email)
        .first();

      if (!user) return null;

      return this.mapUserWithRelations(user);
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  static async create(userData: CreateUserData): Promise<User> {
    try {
      // Hash da senha antes de salvar
      if (userData.password) {
        const salt = await bcrypt.genSalt(12);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      const [user] = await db(this.TABLE_NAME)
        .insert({
          ...userData,
          is_active: userData.is_active ?? true,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      return user;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  static async update(id: number, userData: UpdateUserData): Promise<User | null> {
    try {
      // Hash da senha se fornecida
      if (userData.password) {
        const salt = await bcrypt.genSalt(12);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      const [user] = await db(this.TABLE_NAME)
        .where('id', id)
        .update({
          ...userData,
          updated_at: new Date()
        })
        .returning('*');

      return user || null;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const deletedRows = await db(this.TABLE_NAME)
        .where('id', id)
        .del();

      return deletedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  static async findAll(limit?: number, offset?: number): Promise<UserWithRelations[]> {
    try {
      let query = db(this.TABLE_NAME)
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .leftJoin('institutions', 'users.institution_id', 'institutions.id')
        .select(
          'users.*',
          'roles.id as role_id',
          'roles.name as role_name',
          'institutions.id as institution_id',
          'institutions.name as institution_name'
        )
        .orderBy('users.created_at', 'desc');

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const users = await query;
      return users.map(user => this.mapUserWithRelations(user));
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      throw error;
    }
  }

  static async findByInstitution(institutionId: number): Promise<UserWithRelations[]> {
    try {
      const users = await db(this.TABLE_NAME)
        .leftJoin('roles', 'users.role_id', 'roles.id')
        .leftJoin('institutions', 'users.institution_id', 'institutions.id')
        .select(
          'users.*',
          'roles.id as role_id',
          'roles.name as role_name',
          'institutions.id as institution_id',
          'institutions.name as institution_name'
        )
        .where('users.institution_id', institutionId)
        .orderBy('users.created_at', 'desc');

      return users.map(user => this.mapUserWithRelations(user));
    } catch (error) {
      console.error('Erro ao buscar usuários por instituição:', error);
      throw error;
    }
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Erro ao comparar senhas:', error);
      throw error;
    }
  }

  static async count(): Promise<number> {
    try {
      const result = await db(this.TABLE_NAME).count('id as total').first();
      return parseInt(result?.total as string) || 0;
    } catch (error) {
      console.error('Erro ao contar usuários:', error);
      throw error;
    }
  }

  private static mapUserWithRelations(row: any): UserWithRelations {
    const user: UserWithRelations = {
      id: row.id,
      version: row.version,
      email: row.email,
      password: row.password,
      name: row.name,
      cpf: row.cpf,
      phone: row.phone,
      birth_date: row.birth_date,
      address: row.address,
      city: row.city,
      state: row.state,
      zip_code: row.zip_code,
      endereco: row.endereco,
      telefone: row.telefone,
      usuario: row.usuario,
      unidade_ensino: row.unidade_ensino,
      is_active: row.is_active,
      role_id: row.role_id,
      institution_id: row.institution_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    if (row.role_name) {
      user.role = {
        id: row.role_id,
        name: row.role_name
      };
    }

    if (row.institution_name) {
      user.institution = {
        id: row.institution_id,
        name: row.institution_name
      };
    }

    return user;
  }
}
