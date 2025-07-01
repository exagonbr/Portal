import { UsersRepository } from '../repositories/UsersRepository';
import { Users, CreateUsersData, UpdateUsersData, UsersFilterData, UsersListResult } from '../models/Users';
import bcrypt from 'bcryptjs';

export class UsersService {
  async getAllUsers(): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando todos os usuários');
      const result = await this.usersRepository.getUsers({});
      console.log('✅ [UsersService] Todos os usuários encontrados:', result.items.length);
      return result.items;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar todos os usuários:', error);
      throw error;
    }
  }
  async getAdmins(): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando administradores');
      const result = await this.usersRepository.getUsers({ isAdmin: true });
      console.log('✅ [UsersService] Administradores encontrados:', result.items.length);
      return result.items;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar administradores:', error);
      throw error;
    }
  }
  async getTeachers(): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando professores');
      const result = await this.usersRepository.getUsers({ isTeacher: true });
      console.log('✅ [UsersService] Professores encontrados:', result.items.length);
      return result.items;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar professores:', error);
      throw error;
    }
  }
  async getStudents(): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando estudantes');
      const result = await this.usersRepository.getUsers({ isStudent: true });
      console.log('✅ [UsersService] Estudantes encontrados:', result.items.length);
      return result.items;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar estudantes:', error);
      throw error;
    }
  }
  async getGuardians(): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando responsáveis');
      const result = await this.usersRepository.getUsers({ isGuardian: true });
      console.log('✅ [UsersService] Responsáveis encontrados:', result.items.length);
      return result.items;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar responsáveis:', error);
      throw error;
    }
  }
  async getCoordinators(): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando coordenadores');
      const result = await this.usersRepository.getUsers({ isCoordinator: true });
      console.log('✅ [UsersService] Coordenadores encontrados:', result.items.length);
      return result.items;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar coordenadores:', error);
      throw error;
    }
  }
  async getInstitutionManagers(): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando gestores de instituição');
      const result = await this.usersRepository.getUsers({ isInstitutionManager: true });
      console.log('✅ [UsersService] Gestores de instituição encontrados:', result.items.length);
      return result.items;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar gestores de instituição:', error);
      throw error;
    }
  }
  async softDeleteUser(id: string): Promise<Users | null> {
    try {
      console.log('🗑️ [UsersService] Realizando soft delete do usuário:', id);
      const updatedUser = await this.usersRepository.updateUser(Number(id), { deleted: true });
      if (updatedUser) {
        console.log('✅ [UsersService] Usuário marcado como deletado:', id);
      } else {
        console.log('⚠️ [UsersService] Usuário não encontrado para soft delete:', id);
      }
      return updatedUser;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao realizar soft delete do usuário:', error);
      throw error;
    }
  }
  async resetUserPassword(id: string): Promise<boolean> {
    return this.resetPassword(id);
  }
  async changeUserPassword(id: string, currentPassword: any, newPassword: any): Promise<boolean> {
    try {
      console.log('🔑 [UsersService] Alterando senha do usuário:', id);
      const user = await this.usersRepository.findByIdWithPassword(Number(id));
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password || '');
      if (!isMatch) {
        throw new Error('Senha atual incorreta');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const updated = await this.usersRepository.updateUser(Number(id), {
        password: hashedPassword,
        resetPassword: false,
      });

      if (updated) {
        console.log('✅ [UsersService] Senha alterada com sucesso para o usuário:', id);
      }
      
      return !!updated;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao alterar senha:', error);
      throw error;
    }
  }
  async lockUserAccount(id: string): Promise<Users | null> {
    try {
      console.log('🔒 [UsersService] Bloqueando conta do usuário:', id);
      const updatedUser = await this.usersRepository.updateUser(Number(id), { accountLocked: true });
      if (updatedUser) {
        console.log('✅ [UsersService] Conta do usuário bloqueada:', id);
      }
      return updatedUser;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao bloquear conta do usuário:', error);
      throw error;
    }
  }
  async unlockUserAccount(id: string): Promise<Users | null> {
    try {
      console.log('🔓 [UsersService] Desbloqueando conta do usuário:', id);
      const updatedUser = await this.usersRepository.updateUser(Number(id), { accountLocked: false });
      if (updatedUser) {
        console.log('✅ [UsersService] Conta do usuário desbloqueada:', id);
      }
      return updatedUser;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao desbloquear conta do usuário:', error);
      throw error;
    }
  }
  async authenticateUser(email: any, password: any): Promise<Users | null> {
    try {
      console.log('🔐 [UsersService] Autenticando usuário:', email);
      const user = await this.usersRepository.findByEmailWithPassword(email);

      if (!user) {
        console.log('⚠️ [UsersService] Tentativa de login com email não encontrado:', email);
        return null;
      }

      if (user.accountLocked) {
        console.log('🔒 [UsersService] Tentativa de login em conta bloqueada:', email);
        throw new Error('Conta bloqueada.');
      }
      
      if (!user.enabled) {
        console.log('🚫 [UsersService] Tentativa de login em conta desativada:', email);
        throw new Error('Conta desativada.');
      }

      const isMatch = await bcrypt.compare(password, user.password || '');

      if (isMatch) {
        console.log('✅ [UsersService] Usuário autenticado com sucesso:', email);
        // Retorna o usuário sem a senha
        return this.usersRepository.findById(user.id);
      } else {
        console.log('⚠️ [UsersService] Senha incorreta para o usuário:', email);
        return null;
      }
    } catch (error) {
      console.error('❌ [UsersService] Erro na autenticação:', error);
      throw error;
    }
  }
  private usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  /**
   * Lista usuários com filtros e paginação
   */
  async getUsers(filters: UsersFilterData = {}): Promise<UsersListResult> {
    try {
      console.log('🔍 [UsersService] Buscando usuários com filtros:', filters);
      
      const result = await this.usersRepository.getUsers(filters);
      
      console.log('✅ [UsersService] Usuários encontrados:', {
        total: result.pagination.total,
        page: result.pagination.page,
        items: result.items.length
      });
      
      return result;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar usuários:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string): Promise<Users | null> {
    try {
      console.log('🔍 [UsersService] Buscando usuário por ID:', id);
      
      const user = await this.usersRepository.getUserWithRoleAndInstitution(Number(id));
      
      if (user) {
        console.log('✅ [UsersService] Usuário encontrado:', user.fullName);
      } else {
        console.log('⚠️ [UsersService] Usuário não encontrado');
      }
      
      return user;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string): Promise<Users | null> {
    try {
      console.log('🔍 [UsersService] Buscando usuário por email:', email);
      
      const user = await this.usersRepository.findByEmail(email);
      
      if (user) {
        console.log('✅ [UsersService] Usuário encontrado:', user.fullName);
      } else {
        console.log('⚠️ [UsersService] Usuário não encontrado');
      }
      
      return user;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por username
   */
  async getUserByUsername(username: string): Promise<Users | null> {
    try {
      console.log('🔍 [UsersService] Buscando usuário por username:', username);
      
      const user = await this.usersRepository.findByUsername(username);
      
      if (user) {
        console.log('✅ [UsersService] Usuário encontrado:', user.fullName);
      } else {
        console.log('⚠️ [UsersService] Usuário não encontrado');
      }
      
      return user;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar usuário por username:', error);
      throw error;
    }
  }

  /**
   * Cria novo usuário
   */
  async createUser(userData: CreateUsersData): Promise<Users> {
    try {
      console.log('🆕 [UsersService] Criando usuário:', userData.email);
      
      // Verificar se email já existe
      const existingUser = await this.usersRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      // Hash da senha se fornecida
      let hashedPassword: string | undefined;
      if (userData.password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      }

      // Preparar dados para criação
      const createData: CreateUsersData = {
        ...userData,
        password: hashedPassword,
        enabled: userData.enabled !== undefined ? userData.enabled : true,
        resetPassword: userData.resetPassword !== undefined ? userData.resetPassword : false,
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      } as any;

      const newUser = await this.usersRepository.createUser(createData);
      
      console.log('✅ [UsersService] Usuário criado com sucesso:', newUser.fullName);
      
      return newUser;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string, userData: UpdateUsersData): Promise<Users | null> {
    try {
      console.log('📝 [UsersService] Atualizando usuário:', id);
      
      // Verificar se usuário existe
      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se email já está em uso por outro usuário
      if (userData.email && userData.email !== existingUser.email) {
        const emailInUse = await this.usersRepository.findByEmail(userData.email);
        if (emailInUse) {
          throw new Error('Email já está em uso');
        }
      }

      // Hash da nova senha se fornecida
      let updateData = { ...userData };
      if (userData.password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(userData.password, saltRounds);
      }

      const updatedUser = await this.usersRepository.updateUser(Number(id), updateData);
      
      if (updatedUser) {
        console.log('✅ [UsersService] Usuário atualizado com sucesso:', updatedUser.fullName);
      }
      
      return updatedUser;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Remove usuário
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      console.log('🗑️ [UsersService] Removendo usuário:', id);
      
      // Verificar se usuário existe
      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      const deleted = await this.usersRepository.deleteUser(Number(id));
      
      if (deleted) {
        console.log('✅ [UsersService] Usuário removido com sucesso');
      }
      
      return deleted;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao remover usuário:', error);
      throw error;
    }
  }

  /**
   * Ativa usuário
   */
  async activateUser(id: string): Promise<boolean> {
    try {
      console.log('🔓 [UsersService] Ativando usuário:', id);
      
      const activated = await this.usersRepository.activateUser(Number(id));
      
      if (activated) {
        console.log('✅ [UsersService] Usuário ativado com sucesso');
      }
      
      return activated;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao ativar usuário:', error);
      throw error;
    }
  }

  /**
   * Desativa usuário
   */
  async deactivateUser(id: string): Promise<boolean> {
    try {
      console.log('🔒 [UsersService] Desativando usuário:', id);
      
      const deactivated = await this.usersRepository.deactivateUser(Number(id));
      
      if (deactivated) {
        console.log('✅ [UsersService] Usuário desativado com sucesso');
      }
      
      return deactivated;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao desativar usuário:', error);
      throw error;
    }
  }

  /**
   * Busca usuários por role
   */
  async getUsersByRole(roleId: string): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando usuários por role:', roleId);
      
      const users = await this.usersRepository.getUsersByRole(roleId);
      
      console.log('✅ [UsersService] Usuários encontrados por role:', users.length);
      
      return users;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar usuários por role:', error);
      return [];
    }
  }

  /**
   * Busca usuários por instituição
   */
  async getUsersByInstitution(institutionId: string): Promise<Users[]> {
    try {
      console.log('🔍 [UsersService] Buscando usuários por instituição:', institutionId);
      
      const users = await this.usersRepository.getUsersByInstitution(Number(institutionId));
      
      console.log('✅ [UsersService] Usuários encontrados por instituição:', users.length);
      
      return users;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar usuários por instituição:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<string, number>;
    byInstitution: Record<string, number>;
    newThisMonth: number;
  }> {
    try {
      console.log('📊 [UsersService] Obtendo estatísticas de usuários');
      
      const [
        total,
        active,
        byRole,
        byInstitution,
        newThisMonth
      ] = await Promise.all([
        this.usersRepository.count(),
        this.usersRepository.count({ enabled: true } as any),
        this.usersRepository.getUserStatsByRole(),
        this.usersRepository.getUserStatsByInstitution(),
        this.usersRepository.countNewThisMonth()
      ]);

      const stats = {
        total,
        active,
        inactive: total - active,
        byRole,
        byInstitution,
        newThisMonth
      };
      
      console.log('✅ [UsersService] Estatísticas obtidas:', stats);
      
      return stats;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Busca usuários com termo de pesquisa
   */
  async searchUsers(query: string, filters: Partial<UsersFilterData> = {}): Promise<UsersListResult> {
    try {
      console.log('🔍 [UsersService] Pesquisando usuários:', query);
      
      const searchFilters: UsersFilterData = {
        ...filters,
        search: query
      };
      
      const result = await this.usersRepository.getUsers(searchFilters);
      
      console.log('✅ [UsersService] Pesquisa concluída:', {
        query,
        found: result.items.length,
        total: result.pagination.total
      });
      
      return result;
    } catch (error) {
      console.error('❌ [UsersService] Erro na pesquisa:', error);
      throw error;
    }
  }

  /**
   * Reseta senha do usuário
   */
  async resetPassword(id: string, newPassword?: string): Promise<boolean> {
    try {
      console.log('🔑 [UsersService] Resetando senha do usuário:', id);
      
      // Gerar senha temporária se não fornecida
      const password = newPassword || this.generateTemporaryPassword();
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const updated = await this.usersRepository.updateUser(Number(id), {
        password: hashedPassword,
        resetPassword: true
      });
      
      if (updated) {
        console.log('✅ [UsersService] Senha resetada com sucesso');
        // Aqui você poderia enviar email com a nova senha
      }
      
      return !!updated;
    } catch (error) {
      console.error('❌ [UsersService] Erro ao resetar senha:', error);
      throw error;
    }
  }

  /**
   * Gera senha temporária
   */
  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

}

// Instância singleton do serviço
export const usersService = new UsersService();