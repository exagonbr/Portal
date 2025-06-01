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

export class UserService {
  private readonly baseEndpoint = '/api/users';

  /**
   * Lista todos os usuários com filtros e paginação
   */
  async getUsers(filters?: UserFilterDto): Promise<ListResponse<UserResponseDto>> {
    try {
      // Gera chave de cache baseada nos filtros
      const cacheKey = CacheKeys.USER_LIST(JSON.stringify(filters || {}));
      
      return await withCache(cacheKey, async () => {
        const response = await withRetry(() =>
          apiClient.get<UserResponseDto[]>(this.baseEndpoint, filters as Record<string, string | number | boolean>)
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Falha ao buscar usuários');
        }

        return {
          items: response.data,
          pagination: response.pagination!
        };
      }, CacheTTL.MEDIUM);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
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
  async createUser(userData: CreateUserDto): Promise<UserResponseDto> {
    try {
      const response = await apiClient.post<UserResponseDto>(this.baseEndpoint, userData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao criar usuário');
      }

      // Invalida cache relacionado a usuários
      await invalidateUserCache();

      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string, userData: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const response = await apiClient.put<UserResponseDto>(`${this.baseEndpoint}/${id}`, userData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao atualizar usuário');
      }

      // Invalida cache específico do usuário
      await invalidateUserCache(id);

      return response.data;
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
      const response = await apiClient.delete<{ deleted: boolean }>(`${this.baseEndpoint}/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao remover usuário');
      }

      // Invalida cache específico do usuário
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
  async getUserStats(): Promise<{
    total_users: number;
    users_by_role: Record<string, number>;
    users_by_institution: Record<string, number>;
    recent_registrations: number;
    active_users: number;
  }> {
    try {
      const cacheKey = CacheKeys.USER_STATS;
      
      return await withCache(cacheKey, async () => {
        const response = await withRetry(() =>
          apiClient.get<{
            total_users: number;
            users_by_role: Record<string, number>;
            users_by_institution: Record<string, number>;
            recent_registrations: number;
            active_users: number;
          }>(`${this.baseEndpoint}/stats`)
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Falha ao buscar estatísticas');
        }

        return response.data;
      }, CacheTTL.STATS);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
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
    return this.getUsers(filters);
  }
}

// Instância singleton do serviço de usuários
export const userService = new UserService();

// Funções de conveniência para compatibilidade com código existente
export const listUsers = (filters?: UserFilterDto) => userService.getUsers(filters);
export const createUser = (userData: CreateUserDto) => userService.createUser(userData);
export const updateUser = (id: string, userData: UpdateUserDto) => userService.updateUser(id, userData);
export const deleteUser = (id: string) => userService.deleteUser(id);
export const getUserById = (id: string) => userService.getUserById(id);
export const getUserProfile = () => userService.getProfile();
export const updateUserProfile = (userData: UpdateProfileDto) => userService.updateProfile(userData);
export const changeUserPassword = (passwordData: ChangePasswordDto) => userService.changePassword(passwordData);
export const searchUsers = (query: string, filters?: Partial<UserFilterDto>) => userService.searchUsers(query, filters);