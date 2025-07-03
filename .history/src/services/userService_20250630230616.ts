import { ApiResponse, PaginatedResponseDto } from '@/types/api';

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
  private baseUrl = '/api/users';

  /**
   * Obtém estatísticas de usuários
   */
  async getStats(): Promise<UserStats> {
    try {
      console.log('📊 [UserService] Obtendo estatísticas de usuários');
      
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao obter estatísticas');
      }

      console.log('✅ [UserService] Estatísticas obtidas com sucesso');
      return result.data;
    } catch (error) {
      console.error('❌ [UserService] Erro ao obter estatísticas:', error);
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

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao listar usuários');
      }

      console.log('✅ [UserService] Usuários listados:', {
        total: result.pagination.total,
        items: result.items.length
      });

      return {
        items: result.items,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('❌ [UserService] Erro ao listar usuários:', error);
      throw error;
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string | number): Promise<User> {
    try {
      console.log('🔍 [UserService] Buscando usuário por ID:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar usuário');
      }

      console.log('✅ [UserService] Usuário encontrado:', result.data.fullName);
      return result.data;
    } catch (error) {
      console.error('❌ [UserService] Erro ao buscar usuário:', error);
      throw error;
    }
  }

  /**
   * Obtém perfil do usuário atual
   */
  async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 [UserService] Obtendo perfil do usuário atual');
      
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao obter perfil');
      }

      console.log('✅ [UserService] Perfil obtido:', result.data.fullName);
      return result.data;
    } catch (error) {
      console.error('❌ [UserService] Erro ao obter perfil:', error);
      throw error;
    }
  }

  /**
   * Atualiza perfil do usuário atual
   */
  async updateCurrentUser(data: Partial<UpdateUserData>): Promise<User> {
    try {
      console.log('📝 [UserService] Atualizando perfil do usuário atual');
      
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar perfil');
      }

      console.log('✅ [UserService] Perfil atualizado com sucesso');
      return result.data;
    } catch (error) {
      console.error('❌ [UserService] Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Cria novo usuário
   */
  async createUser(data: CreateUserData): Promise<User> {
    try {
      console.log('🆕 [UserService] Criando usuário:', data.email);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Email já está em uso');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao criar usuário');
      }

      console.log('✅ [UserService] Usuário criado:', result.data.fullName);
      return result.data;
    } catch (error) {
      console.error('❌ [UserService] Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string | number, data: UpdateUserData): Promise<User> {
    try {
      console.log('📝 [UserService] Atualizando usuário:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        if (response.status === 409) {
          throw new Error('Email já está em uso');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao atualizar usuário');
      }

      console.log('✅ [UserService] Usuário atualizado:', result.data.fullName);
      return result.data;
    } catch (error) {
      console.error('❌ [UserService] Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Remove usuário
   */
  async deleteUser(id: string | number): Promise<void> {
    try {
      console.log('🗑️ [UserService] Removendo usuário:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuário não encontrado');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao remover usuário');
      }

      console.log('✅ [UserService] Usuário removido com sucesso');
    } catch (error) {
      console.error('❌ [UserService] Erro ao remover usuário:', error);
      throw error;
    }
  }

  /**
   * Ativa usuário
   */
  async activateUser(id: string | number): Promise<void> {
    try {
      console.log('🔓 [UserService] Ativando usuário:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao ativar usuário');
      }

      console.log('✅ [UserService] Usuário ativado com sucesso');
    } catch (error) {
      console.error('❌ [UserService] Erro ao ativar usuário:', error);
      throw error;
    }
  }

  /**
   * Desativa usuário
   */
  async deactivateUser(id: string | number): Promise<void> {
    try {
      console.log('🔒 [UserService] Desativando usuário:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}/deactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao desativar usuário');
      }

      console.log('✅ [UserService] Usuário desativado com sucesso');
    } catch (error) {
      console.error('❌ [UserService] Erro ao desativar usuário:', error);
      throw error;
    }
  }

  /**
   * Reseta senha do usuário
   */
  async resetPassword(id: string | number): Promise<void> {
    try {
      console.log('🔑 [UserService] Resetando senha do usuário:', id);
      
      const response = await fetch(`${this.baseUrl}/${id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao resetar senha');
      }

      console.log('✅ [UserService] Senha resetada com sucesso');
    } catch (error) {
      console.error('❌ [UserService] Erro ao resetar senha:', error);
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

      const response = await fetch(`${this.baseUrl}/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro na pesquisa');
      }

      console.log('✅ [UserService] Pesquisa concluída:', {
        query,
        found: result.items.length
      });

      return {
        items: result.items,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('❌ [UserService] Erro na pesquisa:', error);
      throw error;
    }
  }

  /**
   * Busca usuários por role
   */
  async getUsersByRole(roleId: string): Promise<User[]> {
    try {
      console.log('🔍 [UserService] Buscando usuários por role:', roleId);
      
      const response = await fetch(`${this.baseUrl}/role/${roleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar usuários por role');
      }

      console.log('✅ [UserService] Usuários encontrados por role:', result.data.length);
      return result.data;
    } catch (error) {
      console.error('❌ [UserService] Erro ao buscar usuários por role:', error);
      throw error;
    }
  }

  /**
   * Busca usuários por instituição
   */
  async getUsersByInstitution(institutionId: number): Promise<User[]> {
    try {
      console.log('🔍 [UserService] Buscando usuários por instituição:', institutionId);
      
      const response = await fetch(`${this.baseUrl}/institution/${institutionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar usuários por instituição');
      }

      console.log('✅ [UserService] Usuários encontrados por instituição:', result.data.length);
      return result.data;
    } catch (error) {
      console.error('❌ [UserService] Erro ao buscar usuários por instituição:', error);
      throw error;
    }
  }

  /**
   * Obtém token de autenticação
   */
  private getToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    }
    return '';
  }
}

// Instância singleton do serviço
export const userService = new UserService();
export default userService;