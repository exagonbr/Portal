import { ApiResponse, PaginatedResponseDto } from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, parseJsonResponse } from '@/lib/api-client';

// Definir interface local para compatibilidade
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  username?: string;
  roleId: string;
  institutionId: number;
  address?: string;
  phone?: string;
  enabled: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isCoordinator: boolean;
  isGuardian: boolean;
  isInstitutionManager: boolean;
  resetPassword: boolean;
  dateCreated: string;
  lastUpdated: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  institution?: {
    id: number;
    name: string;
    type?: string;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  roleId: string;
  institutionId: number;
  address?: string;
  phone?: string;
  username?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  enabled?: boolean;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  roleId?: string;
  institutionId?: number;
  address?: string;
  phone?: string;
  username?: string;
  password?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  enabled?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  institutionId?: number;
  enabled?: boolean;
  sortBy?: 'full_name' | 'email' | 'dateCreated' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byInstitution: Record<string, number>;
  newThisMonth: number;
}

class UserService {
  private baseUrl = '/users';

  /**
   * Obtém estatísticas de usuários
   */
  async getStats(): Promise<UserStats> {
    try {
      console.log('📊 [UserService] Obtendo estatísticas de usuários');
      
      const response = await apiGet(`${this.baseUrl}/stats`);
      const result = await parseJsonResponse<ApiResponse<UserStats>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao obter estatísticas');
      }

      console.log('✅ [UserService] Estatísticas obtidas com sucesso');
      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro ao obter estatísticas:', error);
      throw error;
    }
  }

  /**
   * Lista usuários com filtros e paginação
   */
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    try {
      console.log('📋 [UserService] Listando usuários com filtros:', filters);
      
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.roleId) params.append('roleId', filters.roleId);
      if (filters.institutionId) params.append('institutionId', filters.institutionId.toString());
      if (filters.enabled !== undefined) params.append('enabled', filters.enabled.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await apiGet(`${this.baseUrl}?${params.toString()}`);
      const result = await parseJsonResponse<ApiResponse<PaginatedResponse<User>>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao listar usuários');
      }

      console.log('✅ [UserService] Usuários listados:', {
        total: result.pagination?.total || result.data?.pagination?.total,
        items: result.items?.length || result.data?.items?.length
      });

      // Compatibilidade com diferentes formatos de resposta
      if (result.items && result.pagination) {
        return {
          items: result.items,
          pagination: result.pagination
        };
      } else if (result.data) {
        return result.data;
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error) {
      console.log('❌ [UserService] Erro ao listar usuários:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string | number): Promise<User> {
    try {
      console.log('🔍 [UserService] Buscando usuário por ID:', id);
      
      const response = await apiGet(`${this.baseUrl}/${id}`);
      const result = await parseJsonResponse<ApiResponse<User>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar usuário');
      }

      console.log('✅ [UserService] Usuário encontrado:', result.data.full_name);
      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro ao buscar usuário:', error);
      throw error;
    }
  }

  /**
   * Obtém perfil do usuário atual
   */
  async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 [UserService] Obtendo perfil do usuário atual');
      
      const response = await apiGet(`${this.baseUrl}/me`);
      const result = await parseJsonResponse<ApiResponse<User>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao obter perfil');
      }

      console.log('✅ [UserService] Perfil obtido:', result.data.full_name);
      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro ao obter perfil:', error);
      throw error;
    }
  }

  /**
   * Atualiza perfil do usuário atual
   */
  async updateCurrentUser(data: Partial<UpdateUserData>): Promise<User> {
    try {
      console.log('📝 [UserService] Atualizando perfil do usuário atual');
      
      const response = await apiPut(`${this.baseUrl}/me`, data);
      const result = await parseJsonResponse<ApiResponse<User>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar perfil');
      }

      console.log('✅ [UserService] Perfil atualizado com sucesso');
      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Cria novo usuário
   */
  async createUser(data: CreateUserData): Promise<User> {
    try {
      console.log('🆕 [UserService] Criando usuário:', data.email);
      
      const response = await apiPost(this.baseUrl, data);
      const result = await parseJsonResponse<ApiResponse<User>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar usuário');
      }

      console.log('✅ [UserService] Usuário criado:', result.data.full_name);
      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string | number, data: UpdateUserData): Promise<User> {
    try {
      console.log('📝 [UserService] Atualizando usuário:', id);
      
      const response = await apiPut(`${this.baseUrl}/${id}`, data);
      const result = await parseJsonResponse<ApiResponse<User>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar usuário');
      }

      console.log('✅ [UserService] Usuário atualizado:', result.data.full_name);
      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Remove usuário
   */
  async deleteUser(id: string | number): Promise<void> {
    try {
      console.log('🗑️ [UserService] Removendo usuário:', id);
      
      const response = await apiDelete(`${this.baseUrl}/${id}`);
      const result = await parseJsonResponse<ApiResponse<void>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao remover usuário');
      }

      console.log('✅ [UserService] Usuário removido com sucesso');
    } catch (error) {
      console.log('❌ [UserService] Erro ao remover usuário:', error);
      throw error;
    }
  }

  /**
   * Ativa usuário
   */
  async activateUser(id: string | number): Promise<void> {
    try {
      console.log('🔓 [UserService] Ativando usuário:', id);
      
      const response = await apiPost(`${this.baseUrl}/${id}/activate`);
      const result = await parseJsonResponse<ApiResponse<void>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao ativar usuário');
      }

      console.log('✅ [UserService] Usuário ativado com sucesso');
    } catch (error) {
      console.log('❌ [UserService] Erro ao ativar usuário:', error);
      throw error;
    }
  }

  /**
   * Desativa usuário
   */
  async deactivateUser(id: string | number): Promise<void> {
    try {
      console.log('🔒 [UserService] Desativando usuário:', id);
      
      const response = await apiPost(`${this.baseUrl}/${id}/deactivate`);
      const result = await parseJsonResponse<ApiResponse<void>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao desativar usuário');
      }

      console.log('✅ [UserService] Usuário desativado com sucesso');
    } catch (error) {
      console.log('❌ [UserService] Erro ao desativar usuário:', error);
      throw error;
    }
  }

  /**
   * Reseta senha do usuário
   */
  async resetPassword(id: string | number): Promise<void> {
    try {
      console.log('🔑 [UserService] Resetando senha do usuário:', id);
      
      const response = await apiPost(`${this.baseUrl}/${id}/reset-password`);
      const result = await parseJsonResponse<ApiResponse<void>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao resetar senha');
      }

      console.log('✅ [UserService] Senha resetada com sucesso');
    } catch (error) {
      console.log('❌ [UserService] Erro ao resetar senha:', error);
      throw error;
    }
  }

  /**
   * Pesquisa usuários
   */
  async searchUsers(query: string, filters: Partial<UserFilters> = {}): Promise<PaginatedResponse<User>> {
    try {
      console.log('🔍 [UserService] Pesquisando usuários:', query);
      
      const params = new URLSearchParams();
      params.append('q', query);
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiGet(`${this.baseUrl}/search?${params.toString()}`);
      const result = await parseJsonResponse<ApiResponse<PaginatedResponse<User>>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro na pesquisa');
      }

      console.log('✅ [UserService] Pesquisa concluída:', {
        query,
        found: result.data?.items?.length || 0
      });

      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro na pesquisa:', error);
      throw error;
    }
  }

  /**
   * Busca usuários por role
   */
  async getUsersByRole(roleId: string): Promise<User[]> {
    try {
      console.log('🔍 [UserService] Buscando usuários por role:', roleId);
      
      const response = await apiGet(`${this.baseUrl}/role/${roleId}`);
      const result = await parseJsonResponse<ApiResponse<User[]>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar usuários por role');
      }

      console.log('✅ [UserService] Usuários encontrados por role:', result.data.length);
      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro ao buscar usuários por role:', error);
      throw error;
    }
  }

  /**
   * Busca usuários por instituição
   */
  async getUsersByInstitution(institutionId: number): Promise<User[]> {
    try {
      console.log('🔍 [UserService] Buscando usuários por instituição:', institutionId);
      
      const response = await apiGet(`${this.baseUrl}/institution/${institutionId}`);
      const result = await parseJsonResponse<ApiResponse<User[]>>(response);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar usuários por instituição');
      }

      console.log('✅ [UserService] Usuários encontrados por instituição:', result.data.length);
      return result.data;
    } catch (error) {
      console.log('❌ [UserService] Erro ao buscar usuários por instituição:', error);
      throw error;
    }
  }
}

// Instância singleton do serviço
export const userService = new UserService();
export default userService;