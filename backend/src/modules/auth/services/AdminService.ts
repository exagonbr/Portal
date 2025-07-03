import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { LegacyMapper } from '@core/utils/legacy-mapper';
import { SaberconEntityBase } from '@core/entities/SaberconEntity';
import { knex } from '@core/database/connection';

export interface AdminUser extends SaberconEntityBase {
  email: string;
  name: string;
  password: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  is_verified: boolean;
  email_verified_at?: Date;
  metadata?: any;
}

export interface CreateAdminDTO {
  email: string;
  password: string;
  name: string;
  role?: string;
  permissions?: string[];
  metadata?: any;
}

export class AdminService {
  private readonly defaultAdminPermissions = [
    'admin_master',
    'user_management',
    'institution_management', 
    'content_management',
    'analytics_access',
    'system_settings',
    'backup_restore',
    'migration_control'
  ];

  /**
   * Criar Admin Master do sistema
   */
  async createAdminMaster(adminData: CreateAdminDTO): Promise<AdminUser> {
    try {
      // Verificar se já existe
      const existingAdmin = await this.findByEmail(adminData.email);
      
      if (existingAdmin) {
        throw new Error('Admin com este email já existe');
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      const userId = uuidv4();

      // Preparar dados do admin
      const adminUserData = {
        id: userId,
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: adminData.role || 'admin_master',
        is_active: true,
        is_verified: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        permissions: JSON.stringify(adminData.permissions || this.defaultAdminPermissions),
        metadata: JSON.stringify({
          admin_level: 'master',
          created_by: 'system',
          admin_notes: 'Admin Master criado via AdminService',
          access_level: 'unlimited',
          ...adminData.metadata
        })
      };

      // Inserir no banco
      await knex('users').insert(adminUserData);

      // Criar perfil se tabela existir
      await this.createAdminProfile(userId);

      // Retornar admin criado
      const createdAdmin = await this.findById(userId);
      if (!createdAdmin) {
        throw new Error('Erro ao recuperar admin criado');
      }

      return createdAdmin;

    } catch (error) {
      console.error('Erro ao criar Admin Master:', error);
      throw error;
    }
  }

  /**
   * Buscar admin por email
   */
  async findByEmail(email: string): Promise<AdminUser | null> {
    try {
      const user = await knex('users')
        .where('email', email)
        .first();

      if (!user) return null;

      return this.mapToAdminUser(user);
    } catch (error) {
      console.error('Erro ao buscar admin por email:', error);
      return null;
    }
  }

  /**
   * Buscar admin por ID
   */
  async findById(id: string): Promise<AdminUser | null> {
    try {
      const user = await knex('users')
        .where('id', id)
        .first();

      if (!user) return null;

      return this.mapToAdminUser(user);
    } catch (error) {
      console.error('Erro ao buscar admin por ID:', error);
      return null;
    }
  }

  /**
   * Listar todos os admins
   */
  async findAllAdmins(): Promise<AdminUser[]> {
    try {
      const users = await knex('users')
        .whereIn('role', ['admin_master', 'admin', 'manager'])
        .orderBy('created_at', 'desc');

      return users.map(user => this.mapToAdminUser(user));
    } catch (error) {
      console.error('Erro ao listar admins:', error);
      return [];
    }
  }

  /**
   * Atualizar permissões do admin
   */
  async updatePermissions(adminId: string, permissions: string[]): Promise<boolean> {
    try {
      await knex('users')
        .where('id', adminId)
        .update({
          permissions: JSON.stringify(permissions),
          updated_at: new Date()
        });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      return false;
    }
  }

  /**
   * Verificar se usuário tem permissão específica
   */
  async hasPermission(adminId: string, permission: string): Promise<boolean> {
    try {
      const admin = await this.findById(adminId);
      
      if (!admin || !admin.permissions) return false;

      return admin.permissions.includes(permission) || 
             admin.permissions.includes('admin_master');
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Validar senha do admin
   */
  async validatePassword(email: string, password: string): Promise<AdminUser | null> {
    try {
      const admin = await this.findByEmail(email);
      
      if (!admin) return null;

      const isValid = await bcrypt.compare(password, admin.password);
      
      return isValid ? admin : null;
    } catch (error) {
      console.error('Erro ao validar senha:', error);
      return null;
    }
  }

  /**
   * Atualizar senha do admin
   */
  async updatePassword(adminId: string, newPassword: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      await knex('users')
        .where('id', adminId)
        .update({
          password: hashedPassword,
          updated_at: new Date()
        });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return false;
    }
  }

  /**
   * Desativar admin
   */
  async deactivateAdmin(adminId: string): Promise<boolean> {
    try {
      await knex('users')
        .where('id', adminId)
        .update({
          is_active: false,
          updated_at: new Date()
        });

      return true;
    } catch (error) {
      console.error('Erro ao desativar admin:', error);
      return false;
    }
  }

  /**
   * Estatísticas dos admins do sistema
   */
  async getAdminStats(): Promise<any> {
    try {
      const stats = await knex('users')
        .select(
          knex.raw('COUNT(*) as total_admins'),
          knex.raw('COUNT(CASE WHEN is_active = true THEN 1 END) as active_admins'),
          knex.raw('COUNT(CASE WHEN role = ? THEN 1 END) as master_admins', ['admin_master']),
          knex.raw('COUNT(CASE WHEN created_at > NOW() - INTERVAL \'30 days\' THEN 1 END) as recent_admins')
        )
        .whereIn('role', ['admin_master', 'admin', 'manager'])
        .first();

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas de admins:', error);
      return {
        total_admins: 0,
        active_admins: 0,
        master_admins: 0,
        recent_admins: 0
      };
    }
  }

  /**
   * Criar perfil do admin
   */
  private async createAdminProfile(userId: string): Promise<void> {
    try {
      const profileExists = await knex.schema.hasTable('user_profiles');
      
      if (profileExists) {
        const existingProfile = await knex('user_profiles')
          .where('user_id', userId)
          .first();
          
        if (!existingProfile) {
          await knex('user_profiles').insert({
            id: uuidv4(),
            user_id: userId,
            bio: 'Administrador do Portal Educacional',
            avatar_url: null,
            phone: null,
            address: null,
            preferences: JSON.stringify({
              theme: 'dark',
              language: 'pt-BR',
              notifications: {
                email: true,
                push: true,
                sms: false
              },
              dashboard: {
                layout: 'admin',
                widgets: ['users', 'content', 'analytics', 'system']
              }
            }),
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
    } catch (error) {
      console.log('Aviso: Não foi possível criar perfil do admin');
    }
  }

  /**
   * Mapear dados do banco para AdminUser
   */
  private mapToAdminUser(userData: any): AdminUser {
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      password: userData.password,
      role: userData.role,
      permissions: userData.permissions ? JSON.parse(userData.permissions) : [],
      is_active: userData.is_active,
      is_verified: userData.is_verified,
      email_verified_at: userData.email_verified_at,
      sabercon_id: userData.sabercon_id,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      metadata: userData.metadata ? JSON.parse(userData.metadata) : null
    };
  }

  /**
   * Verificar se é um admin migrado do SaberCon
   */
  async isLegacyAdmin(adminId: string): Promise<boolean> {
    return await LegacyMapper.isLegacyRecord('users', adminId);
  }

  /**
   * Obter metadados de migração se for admin legacy
   */
  async getLegacyMetadata(adminId: string): Promise<any> {
    const admin = await this.findById(adminId);
    
    if (!admin) return null;

    if (admin.sabercon_id) {
      return {
        isLegacy: true,
        saberconId: admin.sabercon_id,
        migratedAt: admin.created_at,
        originalSystem: 'SaberCon'
      };
    }

    return {
      isLegacy: false,
      createdAt: admin.created_at,
      system: 'Portal Educacional'
    };
  }
} 