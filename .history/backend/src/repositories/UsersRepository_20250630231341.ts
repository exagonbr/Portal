import { BaseRepository } from './BaseRepository';
import { Users, CreateUsersData, UpdateUsersData, UsersFilterData, UsersListResult } from '../models/Users';
import db from '../config/database';

export class UsersRepository extends BaseRepository<Users> {
  protected tableName = 'users';

  constructor() {
    super('users');
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<Users | null> {
    try {
      const result = await db(this.tableName)
        .where({ email })
        .first();
      
      if (!result) return null;
      
      return this.mapDatabaseToUsers(result);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por username
   */
  async findByUsername(username: string): Promise<Users | null> {
    try {
      const result = await db(this.tableName)
        .where({ username })
        .first();
      
      if (!result) return null;
      
      return this.mapDatabaseToUsers(result);
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  /**
   * Cria novo usuário
   */
  async createUser(data: CreateUsersData): Promise<Users> {
    try {
      const mappedData = this.mapUsersToDatabase(data);
      const [result] = await db(this.tableName)
        .insert(mappedData)
        .returning('*');
      
      return this.mapDatabaseToUsers(result);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string, data: UpdateUsersData): Promise<Users | null> {
    try {
      const mappedData = this.mapUsersToDatabase(data);
      mappedData.lastUpdated = new Date().toISOString();
      
      const [result] = await db(this.tableName)
        .where({ id })
        .update(mappedData)
        .returning('*');
      
      if (!result) return null;
      
      return this.mapDatabaseToUsers(result);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Remove usuário
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const deletedRows = await db(this.tableName)
        .where({ id })
        .del();
      
      return deletedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID com informações de role e instituição
   */
  async getUserWithRoleAndInstitution(id: string): Promise<any | null> {
    try {
      const result = await db(this.tableName)
        .leftJoin('roles', 'users.roleId', 'roles.id')
        .leftJoin('institutions', 'users.institutionId', 'institutions.id')
        .select(
          'users.*',
          'roles.name as role_name',
          'institutions.name as institution_name'
        )
        .where('users.id', id)
        .first();
      
      if (!result) return null;
      
      return this.mapDatabaseToUsers(result);
    } catch (error) {
      console.error('Error getting user with role and institution:', error);
      // Fallback para busca simples
      const user = await this.findById(id);
      return user;
    }
  }

  /**
   * Lista usuários com filtros e paginação
   */
  async getUsers(filters: UsersFilterData = {}): Promise<UsersListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fullName',
        sortOrder = 'asc',
        search,
        ...otherFilters
      } = filters;

      let query = db(this.tableName)
        .leftJoin('roles', 'users.roleId', 'roles.id')
        .leftJoin('institutions', 'users.institutionId', 'institutions.id')
        .select(
          'users.*',
          'roles.name as role_name',
          'institutions.name as institution_name'
        );

      // Aplicar filtros
      if (search) {
        query = query.where(function() {
          this.where('users.fullName', 'ilike', `%${search}%`)
            .orWhere('users.email', 'ilike', `%${search}%`);
        });
      }

      // Filtros específicos
      Object.entries(otherFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Mapear campos do frontend para campos do banco
          const dbField = this.mapFilterFieldToDatabase(key);
          if (dbField) {
            query = query.where(`users.${dbField}`, value);
          }
        }
      });

      // Contar total
      const countQuery = query.clone().clearSelect().count('users.id as total').first();
      const totalResult = await countQuery;
      const total = parseInt(String(totalResult?.total || '0'), 10);

      // Aplicar ordenação
      const dbSortField = this.mapSortFieldToDatabase(sortBy);
      query = query.orderBy(`users.${dbSortField}`, sortOrder);

      // Aplicar paginação
      const offset = (page - 1) * limit;
      query = query.limit(limit).offset(offset);

      const results = await query;
      const items = results.map(result => this.mapDatabaseToUsers(result));

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
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Busca usuários por role ID
   */
  async getUsersByRole(roleId: string): Promise<Users[]> {
    try {
      const results = await db(this.tableName)
        .where({ roleId })
        .orderBy('fullName', 'asc');
      
      return results.map(result => this.mapDatabaseToUsers(result));
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Busca usuários por instituição
   */
  async getUsersByInstitution(institutionId: string): Promise<Users[]> {
    try {
      const results = await db(this.tableName)
        .where({ institutionId })
        .orderBy('fullName', 'asc');
      
      return results.map(result => this.mapDatabaseToUsers(result));
    } catch (error) {
      console.error('Error getting users by institution:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de usuários por role
   */
  async getUserStatsByRole(): Promise<Record<string, number>> {
    try {
      const result = await db(this.tableName)
        .leftJoin('roles', 'users.roleId', 'roles.id')
        .select('roles.name as role_name')
        .count('users.id as count')
        .groupBy('roles.name');

      const stats: Record<string, number> = {};
      result.forEach((row: any) => {
        stats[row.role_name || 'Sem função'] = parseInt(row.count, 10) || 0;
      });
      return stats;
    } catch (error) {
      console.error('Error fetching user stats by role:', error);
      return {};
    }
  }

  /**
   * Obtém estatísticas de usuários por instituição
   */
  async getUserStatsByInstitution(): Promise<Record<string, number>> {
    try {
      const result = await db(this.tableName)
        .leftJoin('institutions', 'users.institutionId', 'institutions.id')
        .select('institutions.name as institution_name')
        .count('users.id as count')
        .groupBy('institutions.name');

      const stats: Record<string, number> = {};
      result.forEach((row: any) => {
        stats[row.institution_name || 'Sem instituição'] = parseInt(row.count, 10) || 0;
      });
      return stats;
    } catch (error) {
      console.error('Error fetching user stats by institution:', error);
      return {};
    }
  }

  /**
   * Conta usuários novos do mês
   */
  async countNewThisMonth(): Promise<number> {
    try {
      const firstDayOfMonth = new Date(new Date().setDate(1));
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const result = await db(this.tableName)
        .where('dateCreated', '>=', firstDayOfMonth.toISOString())
        .count('id as count')
        .first();
        
      return parseInt(String(result?.count || '0'), 10);
    } catch (error) {
      console.error('Error counting new users this month:', error);
      return 0;
    }
  }

  /**
   * Ativa usuário
   */
  async activateUser(id: string): Promise<boolean> {
    try {
      const updatedRows = await db(this.tableName)
        .where({ id })
        .update({ 
          enabled: true,
          lastUpdated: new Date().toISOString()
        });
      
      return updatedRows > 0;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  /**
   * Desativa usuário
   */
  async deactivateUser(id: string): Promise<boolean> {
    try {
      const updatedRows = await db(this.tableName)
        .where({ id })
        .update({ 
          enabled: false,
          lastUpdated: new Date().toISOString()
        });
      
      return updatedRows > 0;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por email, incluindo a senha.
   * Usar apenas para autenticação.
   */
  async findByEmailWithPassword(email: string): Promise<any | null> {
    try {
      const result = await db(this.tableName)
        .where({ email })
        .select('*') // Garante que todos os campos, incluindo password, sejam retornados
        .first();
      
      return result || null;
    } catch (error) {
      console.error('Error finding user by email with password:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID, incluindo a senha.
   * Usar apenas para verificação de senha.
   */
  async findByIdWithPassword(id: string): Promise<any | null> {
    try {
      const result = await db(this.tableName)
        .where({ id })
        .select('*') // Garante que todos os campos, incluindo password, sejam retornados
        .first();
      
      return result || null;
    } catch (error) {
      console.error('Error finding user by id with password:', error);
      throw error;
    }
  }

  /**
   * Mapeia dados do banco para o modelo Users
   */
  private mapDatabaseToUsers(data: any): Users {
    return {
      ...data,
      // Mapeamentos para compatibilidade
      name: data.fullName || data.name,
      role_id: data.roleId || data.role_id,
      institution_id: data.institutionId || data.institution_id,
      is_active: data.enabled !== undefined ? data.enabled : data.is_active,
      created_at: data.dateCreated || data.created_at,
      updated_at: data.lastUpdated || data.updated_at,
      telefone: data.phone || data.telefone,
      endereco: data.address || data.endereco,
      // Campos originais
      id: String(data.id),
      email: data.email,
      fullName: data.fullName || data.name,
      roleId: data.roleId || data.role_id,
      institutionId: data.institutionId || data.institution_id,
      enabled: data.enabled !== undefined ? data.enabled : data.is_active,
      dateCreated: data.dateCreated || data.created_at,
      lastUpdated: data.lastUpdated || data.updated_at,
      phone: data.phone || data.telefone,
      address: data.address || data.endereco,
      isAdmin: data.isAdmin || false,
      isManager: data.isManager || false,
      isStudent: data.isStudent || false,
      isTeacher: data.isTeacher || false,
      isCoordinator: data.isCoordinator || false,
      isGuardian: data.isGuardian || false,
      isInstitutionManager: data.isInstitutionManager || false,
      resetPassword: data.resetPassword || false,
      // Campos enriquecidos
      role_name: data.role_name,
      institution_name: data.institution_name
    };
  }

  /**
   * Mapeia dados do modelo Users para o banco
   */
  private mapUsersToDatabase(data: any): any {
    const mapped: any = { ...data };
    
    // Mapeamentos de campos
    if (data.name && !data.fullName) mapped.fullName = data.name;
    if (data.role_id && !data.roleId) mapped.roleId = data.role_id;
    if (data.institution_id && !data.institutionId) mapped.institutionId = data.institution_id;
    if (data.is_active !== undefined && data.enabled === undefined) mapped.enabled = data.is_active;
    if (data.telefone && !data.phone) mapped.phone = data.telefone;
    if (data.endereco && !data.address) mapped.address = data.endereco;
    
    // Remover campos que não existem no banco
    delete mapped.name;
    delete mapped.role_id;
    delete mapped.institution_id;
    delete mapped.is_active;
    delete mapped.created_at;
    delete mapped.updated_at;
    delete mapped.telefone;
    delete mapped.endereco;
    delete mapped.role_name;
    delete mapped.institution_name;
    
    return mapped;
  }

  /**
   * Mapeia campos de filtro para campos do banco
   */
  private mapFilterFieldToDatabase(field: string): string | null {
    const mapping: Record<string, string> = {
      'name': 'fullName',
      'role_id': 'roleId',
      'roleId': 'roleId',
      'institution_id': 'institutionId',
      'institutionId': 'institutionId',
      'is_active': 'enabled',
      'enabled': 'enabled',
      'telefone': 'phone',
      'endereco': 'address'
    };
    
    return mapping[field] || field;
  }

  /**
   * Mapeia campos de ordenação para campos do banco
   */
  private mapSortFieldToDatabase(field: string): string {
    const mapping: Record<string, string> = {
      'name': 'fullName',
      'fullName': 'fullName',
      'email': 'email',
      'dateCreated': 'dateCreated',
      'lastUpdated': 'lastUpdated'
    };
    
    return mapping[field] || 'fullName';
  }

  /**
   * Busca usuário por ID (override do BaseRepository)
   */
  async findById(id: string | number): Promise<Users | null> {
    try {
      const result = await db(this.tableName)
        .where({ id })
        .first();
      
      if (!result) return null;
      
      return this.mapDatabaseToUsers(result);
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  /**
   * Conta total de usuários
   */
  async count(filters: Partial<Users> = {}): Promise<number> {
    try {
      let query = db(this.tableName);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = this.mapFilterFieldToDatabase(key);
          if (dbField) {
            query = query.where(dbField, value);
          }
        }
      });
      
      const result = await query.count('id as count').first();
      return parseInt(String(result?.count || '0'), 10);
    } catch (error) {
      console.error('Error counting users:', error);
      return 0;
    }
  }

  /**
   * Busca todos os usuários com filtros
   */
  async findAll(filters: Partial<Users> = {}): Promise<Users[]> {
    try {
      let query = db(this.tableName);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          const dbField = this.mapFilterFieldToDatabase(key);
          if (dbField) {
            query = query.where(dbField, value);
          }
        }
      });
      
      const results = await query.orderBy('fullName', 'asc');
      return results.map(result => this.mapDatabaseToUsers(result));
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  }
}