import { apiClient, handleApiError, withRetry } from './apiClient';
import {
  cacheService,
  CacheKeys,
  CacheTTL,
  withCache,
  invalidateUserCache
} from './cacheService';
import { queueService, JobTypes, addUserImportJob, addUserExportJob } from './queueService';
import {
  UserResponseDto,
  UserWithRoleDto,
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  ChangePasswordDto,
  UserFilterDto,
  UserCourseDto,
  ApiResponse,
  ListResponse,
  PaginationParams
} from '../types/api';
import { apiService } from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  status: 'active' | 'inactive' | 'blocked';
  lastAccess?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  institution?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface UserStats {
  total: number;
  active: number;
  new: number;
  blocked: number;
}

export class UserService {
  private readonly baseEndpoint = '/api/users';

  /**
   * Lista todos os usuários com filtros e paginação
   */
  async getUsers(filters: UserFilters = {}): Promise<{ users: User[]; total: number }> {
    try {
      const cacheKey = CacheKeys.USER_LIST(JSON.stringify(filters));
      
      return await withCache(cacheKey, async () => {
        const response = await withRetry(() =>
          apiClient.get<ListResponse<UserResponseDto>>(`${this.baseEndpoint}`, filters as Record<string, string | number | boolean>)
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Falha ao listar usuários');
        }

        // Converter UserResponseDto para User
        const users = (response.data.items || []).map(item => ({
          id: item.id,
          name: item.name,
          email: item.email,
          role: item.role?.name || '',
          institution: item.institution_id,
          status: 'active' as 'active' | 'inactive' | 'blocked',
          lastAccess: undefined,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
        const total = response.data.pagination?.total || users.length;

        return { users, total };
      }, CacheTTL.SHORT);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string): Promise<UserWithRoleDto> {
    try {
      const cacheKey = CacheKeys.USER_BY_ID(id);
      
      return await withCache(cacheKey, async () => {
        const response = await withRetry(() =>
          apiClient.get<UserWithRoleDto>(`${this.baseEndpoint}/${id}`)
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Usuário não encontrado');
        }

        return response.data;
      }, CacheTTL.MEDIUM);
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca perfil do usuário autenticado
   */
  async getProfile(): Promise<UserWithRoleDto> {
    try {
      // Não cacheia perfil do usuário atual para manter dados sempre atualizados
      const response = await withRetry(() =>
        apiClient.get<UserWithRoleDto>(`${this.baseEndpoint}/me`)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar perfil');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cria novo usuário
   */
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      // Converte de User para CreateUserDto
      const createUserData: CreateUserDto = {
        name: userData.name!,
        email: userData.email!,
        password: (userData as any).password || '',
        role_id: (userData as any).role_id || userData.role!,
        institution_id: userData.institution,
        is_active: userData.status === 'active'
      };

      const response = await apiClient.post<UserResponseDto>(`${this.baseEndpoint}`, createUserData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao criar usuário');
      }

      // Invalida o cache de usuários
      await invalidateUserCache();

      // Converte de UserResponseDto para User
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role?.name || '',
        institution: response.data.institution_id,
        status: 'active',
        lastAccess: undefined,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      // Converte de User para UpdateUserDto
      const updateUserData: UpdateUserDto = {};
      
      if (userData.name !== undefined) updateUserData.name = userData.name;
      if (userData.email !== undefined) updateUserData.email = userData.email;
      if ((userData as any).password !== undefined) updateUserData.password = (userData as any).password;
      if (userData.role !== undefined) updateUserData.role_id = (userData as any).role_id || userData.role;
      if (userData.institution !== undefined) updateUserData.institution_id = userData.institution;
      if (userData.status !== undefined) updateUserData.is_active = userData.status === 'active';

      const response = await apiClient.put<UserResponseDto>(`${this.baseEndpoint}/${id}`, updateUserData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao atualizar usuário');
      }

      // Invalida o cache do usuário
      await invalidateUserCache(id);

      // Converte de UserResponseDto para User
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role?.name || '',
        institution: response.data.institution_id,
        status: 'active',
        lastAccess: undefined,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      };
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Atualiza perfil do usuário autenticado
   */
  async updateProfile(userData: UpdateProfileDto): Promise<UserResponseDto> {
    try {
      const response = await apiClient.put<UserResponseDto>(`${this.baseEndpoint}/me`, userData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao atualizar perfil');
      }

      // Invalida cache do perfil do usuário
      const userId = response.data.id;
      await invalidateUserCache(userId);

      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove usuário
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${this.baseEndpoint}/${id}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Falha ao remover usuário');
      }

      // Invalida o cache do usuário
      await invalidateUserCache(id);
    } catch (error) {
      console.error(`Erro ao remover usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca cursos do usuário
   */
  async getUserCourses(id: string): Promise<UserCourseDto[]> {
    try {
      const cacheKey = CacheKeys.USER_COURSES(id);
      
      return await withCache(cacheKey, async () => {
        const response = await withRetry(() =>
          apiClient.get<UserCourseDto[]>(`${this.baseEndpoint}/${id}/courses`)
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Falha ao buscar cursos do usuário');
        }

        return response.data;
      }, CacheTTL.MEDIUM);
    } catch (error) {
      console.error(`Erro ao buscar cursos do usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca cursos do usuário autenticado
   */
  async getMyCourses(): Promise<UserCourseDto[]> {
    try {
      const response = await withRetry(() => 
        apiClient.get<UserCourseDto[]>(`${this.baseEndpoint}/me/courses`)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar seus cursos');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cursos do usuário:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Altera senha do usuário autenticado
   */
  async changePassword(passwordData: ChangePasswordDto): Promise<void> {
    try {
      const response = await apiClient.post<{ changed: boolean }>(`${this.baseEndpoint}/me/change-password`, passwordData);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuários por termo de pesquisa
   */
  async searchUsers(query: string, filters?: Partial<UserFilterDto>): Promise<ListResponse<UserResponseDto>> {
    try {
      const searchParams = {
        q: query,
        ...filters
      };

      const response = await withRetry(() =>
        apiClient.get<UserResponseDto[]>(`${this.baseEndpoint}/search`, searchParams as Record<string, string | number | boolean>)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha na busca de usuários');
      }

      return {
        items: response.data,
        pagination: response.pagination!
      };
    } catch (error) {
      console.error('Erro na busca de usuários:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string): Promise<UserResponseDto> {
    try {
      const response = await withRetry(() => 
        apiClient.get<UserResponseDto>(`${this.baseEndpoint}/by-email/${encodeURIComponent(email)}`)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Usuário não encontrado');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário por email ${email}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuário por username
   */
  async getUserByUsername(username: string): Promise<UserResponseDto> {
    try {
      const response = await withRetry(() => 
        apiClient.get<UserResponseDto>(`${this.baseEndpoint}/by-username/${encodeURIComponent(username)}`)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Usuário não encontrado');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuário por username ${username}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Importa usuários em lote
   */
  async importUsers(file: File): Promise<{ jobId: string }> {
    try {
      // Usa fila para importação assíncrona
      const jobId = await addUserImportJob(file, {
        priority: 5,
        maxAttempts: 1,
        timeout: 300000 // 5 minutos
      });

      // Invalida cache de usuários após adicionar à fila
      await invalidateUserCache();

      return { jobId };
    } catch (error) {
      console.error('Erro na importação de usuários:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Exporta usuários
   */
  async exportUsers(filters?: UserFilterDto, format: 'csv' | 'xlsx' = 'csv'): Promise<{ jobId: string }> {
    try {
      // Usa fila para exportação assíncrona
      const jobId = await addUserExportJob(filters, format, {
        priority: 3,
        maxAttempts: 2,
        timeout: 180000 // 3 minutos
      });

      return { jobId };
    } catch (error) {
      console.error('Erro na exportação de usuários:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const cacheKey = CacheKeys.USER_STATS;
      
      return await withCache(cacheKey, async () => {
        const response = await withRetry(() =>
          apiClient.get<UserStats>(`${this.baseEndpoint}/stats`)
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Falha ao obter estatísticas de usuários');
        }

        return response.data;
      }, CacheTTL.SHORT);
    } catch (error) {
      console.error('Erro ao obter estatísticas de usuários:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Valida se email está disponível
   */
  async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const params: any = { email };
      if (excludeUserId) {
        params.exclude = excludeUserId;
      }

      const response = await apiClient.get<{ available: boolean }>(`${this.baseEndpoint}/validate/email`, params);

      return response.success && response.data?.available === true;
    } catch (error) {
      console.error('Erro ao validar email:', error);
      return false;
    }
  }

  /**
   * Valida se username está disponível
   */
  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      const params: any = { username };
      if (excludeUserId) {
        params.exclude = excludeUserId;
      }

      const response = await apiClient.get<{ available: boolean }>(`${this.baseEndpoint}/validate/username`, params);

      return response.success && response.data?.available === true;
    } catch (error) {
      console.error('Erro ao validar username:', error);
      return false;
    }
  }

  /**
   * Método list para compatibilidade com outros serviços
   */
  async list(filters?: UserFilterDto): Promise<ListResponse<UserResponseDto>> {
    const { users, total } = await this.getUsers(filters as unknown as UserFilters);
    
    // Converter User para UserResponseDto
    const items: UserResponseDto[] = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        name: user.role,
        permissions: []
      },
      institution_id: user.institution,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }));
    
    return {
      items,
      pagination: {
        total,
        page: 1,
        limit: items.length,
        totalPages: Math.ceil(total / items.length) || 1,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  // Bloquear/Desbloquear usuário
  async toggleUserStatus(id: string, status: 'active' | 'inactive' | 'blocked'): Promise<User> {
    try {
      const response = await apiClient.patch<UserResponseDto>(`${this.baseEndpoint}/${id}/status`, { 
        status 
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || `Falha ao alterar status do usuário para ${status}`);
      }

      // Invalida o cache do usuário
      await invalidateUserCache(id);

      // Converte de UserResponseDto para User
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role?.name || '',
        institution: response.data.institution_id,
        status: status,
        lastAccess: undefined,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      };
    } catch (error) {
      console.error(`Erro ao alterar status do usuário ${id} para ${status}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  // Atualizar permissões do usuário
  async updateUserPermissions(id: string, permissions: string[]): Promise<User> {
    try {
      const response = await apiClient.patch<UserResponseDto>(`${this.baseEndpoint}/${id}/permissions`, { 
        permissions 
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao atualizar permissões do usuário');
      }

      // Invalida o cache do usuário
      await invalidateUserCache(id);

      // Converte de UserResponseDto para User
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role?.name || '',
        institution: response.data.institution_id,
        status: 'active',
        lastAccess: undefined,
        createdAt: response.data.created_at,
        updatedAt: response.data.updated_at
      };
    } catch (error) {
      console.error(`Erro ao atualizar permissões do usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }
}

// Instância singleton do serviço de usuários
export const userService = new UserService();

// Funções de conveniência para compatibilidade com código existente
export const listUsers = (filters?: UserFilterDto) => userService.getUsers({} as UserFilters).then(({ users }) => ({
  items: users,
  pagination: { total: users.length, page: 1, limit: users.length }
}));
export const createUser = (userData: Partial<User>) => userService.createUser(userData);
export const updateUser = (id: string, userData: Partial<User>) => userService.updateUser(id, userData);
export const deleteUser = (id: string) => userService.deleteUser(id);
export const getUserById = (id: string) => userService.getUserById(id);
export const getUserProfile = () => userService.getProfile();
export const updateUserProfile = (userData: UpdateProfileDto) => userService.updateProfile(userData);
export const changeUserPassword = (passwordData: ChangePasswordDto) => userService.changePassword(passwordData);
export const searchUsers = (query: string, filters?: Partial<UserFilterDto>) => userService.searchUsers(query, filters);