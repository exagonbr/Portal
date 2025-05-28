import { apiClient, handleApiError, ApiClientError } from './apiClient';
import {
  cacheService,
  CacheKeys,
  CacheTTL,
  withCache,
  invalidateRoleCache
} from './cacheService';
import { queueService, JobTypes } from './queueService';
import {
  RoleResponseDto,
  RoleCreateDto,
  RoleUpdateDto,
  PaginatedResponseDto,
  ApiResponse
} from '../types/api';

export interface RoleFilters {
  name?: string;
  description?: string;
  active?: boolean;
  search?: string;
}

export interface RoleListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: RoleFilters;
}

export class RoleService {
  private readonly baseEndpoint = '/roles';

  /**
   * Busca todas as roles com paginação e filtros
   */
  async getRoles(options: RoleListOptions = {}): Promise<PaginatedResponseDto<RoleResponseDto>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        filters = {}
      } = options;

      // Gera chave de cache baseada nos parâmetros
      const cacheKey = CacheKeys.ROLE_LIST(JSON.stringify({ page, limit, sortBy, sortOrder, filters }));

      return await withCache(cacheKey, async () => {
        // Converte filtros para parâmetros de query
        const searchParams: Record<string, string | number | boolean> = {
          page,
          limit,
          sortBy,
          sortOrder
        };

        // Adiciona filtros se fornecidos
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams[key] = value;
          }
        });

        const response = await apiClient.get<PaginatedResponseDto<RoleResponseDto>>(
          this.baseEndpoint,
          searchParams
        );

        if (!response.success) {
          throw new Error(response.message || 'Falha ao buscar roles');
        }

        return response.data!;
      }, CacheTTL.MEDIUM);
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca role por ID
   */
  async getRoleById(id: string): Promise<RoleResponseDto> {
    try {
      const cacheKey = CacheKeys.ROLE_BY_ID(id);

      return await withCache(cacheKey, async () => {
        const response = await apiClient.get<RoleResponseDto>(`${this.baseEndpoint}/${id}`);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Role não encontrada');
        }

        return response.data;
      }, CacheTTL.MEDIUM);
    } catch (error) {
      console.error(`Erro ao buscar role ${id}:`, error);
      
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error('Role não encontrada');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cria nova role
   */
  async createRole(roleData: RoleCreateDto): Promise<RoleResponseDto> {
    try {
      // Validação básica
      if (!roleData.name?.trim()) {
        throw new Error('Nome da role é obrigatório');
      }

      const response = await apiClient.post<RoleResponseDto>(this.baseEndpoint, roleData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao criar role');
      }

      // Invalida cache relacionado a roles
      await invalidateRoleCache();

      return response.data;
    } catch (error) {
      console.error('Erro ao criar role:', error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 409) {
          throw new Error('Já existe uma role com este nome');
        }
        if (error.status === 400) {
          throw new Error(error.errors?.join(', ') || 'Dados inválidos');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Atualiza role existente
   */
  async updateRole(id: string, roleData: RoleUpdateDto): Promise<RoleResponseDto> {
    try {
      const response = await apiClient.put<RoleResponseDto>(`${this.baseEndpoint}/${id}`, roleData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao atualizar role');
      }

      // Invalida cache específico da role
      await invalidateRoleCache(id);

      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar role ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Role não encontrada');
        }
        if (error.status === 409) {
          throw new Error('Já existe uma role com este nome');
        }
        if (error.status === 400) {
          throw new Error(error.errors?.join(', ') || 'Dados inválidos');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove role
   */
  async deleteRole(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<void>(`${this.baseEndpoint}/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao deletar role');
      }

      // Invalida cache específico da role
      await invalidateRoleCache(id);
    } catch (error) {
      console.error(`Erro ao deletar role ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Role não encontrada');
        }
        if (error.status === 409) {
          throw new Error('Não é possível deletar role que está em uso');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca roles ativas (para dropdowns e seletores)
   */
  async getActiveRoles(): Promise<RoleResponseDto[]> {
    try {
      const cacheKey = CacheKeys.ACTIVE_ROLES;

      return await withCache(cacheKey, async () => {
        const response = await this.getRoles({
          filters: { active: true },
          limit: 100, // Busca muitas roles ativas
          sortBy: 'name',
          sortOrder: 'asc'
        });

        return response.items;
      }, CacheTTL.LONG);
    } catch (error) {
      console.error('Erro ao buscar roles ativas:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca roles por nome (para autocomplete)
   */
  async searchRolesByName(name: string): Promise<RoleResponseDto[]> {
    try {
      if (!name.trim()) {
        return [];
      }

      const response = await this.getRoles({
        filters: { search: name.trim() },
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc'
      });

      return response.items;
    } catch (error) {
      console.error('Erro ao buscar roles por nome:', error);
      return [];
    }
  }

  /**
   * Ativa/desativa role
   */
  async toggleRoleStatus(id: string, active: boolean): Promise<RoleResponseDto> {
    try {
      const response = await apiClient.patch<RoleResponseDto>(
        `${this.baseEndpoint}/${id}/status`,
        { active }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao alterar status da role');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao alterar status da role ${id}:`, error);
      
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error('Role não encontrada');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca estatísticas das roles
   */
  async getRoleStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    usersCount: Record<string, number>;
  }> {
    try {
      const cacheKey = CacheKeys.ROLE_STATS;

      return await withCache(cacheKey, async () => {
        const response = await apiClient.get<{
          total: number;
          active: number;
          inactive: number;
          usersCount: Record<string, number>;
        }>(`${this.baseEndpoint}/stats`);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Falha ao buscar estatísticas');
        }

        return response.data;
      }, CacheTTL.STATS);
    } catch (error) {
      console.error('Erro ao buscar estatísticas das roles:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verifica se role pode ser deletada
   */
  async canDeleteRole(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const response = await apiClient.get<{ canDelete: boolean; reason?: string }>(
        `${this.baseEndpoint}/${id}/can-delete`
      );

      if (!response.success || !response.data) {
        return { canDelete: false, reason: 'Erro ao verificar se role pode ser deletada' };
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao verificar se role ${id} pode ser deletada:`, error);
      return { canDelete: false, reason: handleApiError(error) };
    }
  }

  /**
   * Duplica role existente
   */
  async duplicateRole(id: string, newName: string): Promise<RoleResponseDto> {
    try {
      if (!newName.trim()) {
        throw new Error('Nome para a nova role é obrigatório');
      }

      const response = await apiClient.post<RoleResponseDto>(
        `${this.baseEndpoint}/${id}/duplicate`,
        { name: newName.trim() }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao duplicar role');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao duplicar role ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Role original não encontrada');
        }
        if (error.status === 409) {
          throw new Error('Já existe uma role com este nome');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Exporta roles para CSV
   */
  async exportRoles(filters?: RoleFilters, format: 'csv' | 'xlsx' = 'csv'): Promise<{ jobId: string }> {
    try {
      // Usa fila para exportação assíncrona
      const jobId = await queueService.addJob(JobTypes.REPORT_EXPORT, {
        type: 'roles',
        filters,
        format
      }, {
        priority: 3,
        maxAttempts: 2,
        timeout: 180000 // 3 minutos
      });

      return { jobId };
    } catch (error) {
      console.error('Erro ao exportar roles:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Importa roles de arquivo CSV
   */
  async importRoles(file: File): Promise<{ jobId: string }> {
    try {
      // Usa fila para importação assíncrona
      const jobId = await queueService.addJob(JobTypes.FILE_PROCESS, {
        type: 'roles_import',
        file: file.name,
        size: file.size
      }, {
        priority: 5,
        maxAttempts: 1,
        timeout: 300000 // 5 minutos
      });

      // Invalida cache de roles após adicionar à fila
      await invalidateRoleCache();

      return { jobId };
    } catch (error) {
      console.error('Erro ao importar roles:', error);
      throw new Error(handleApiError(error));
    }
  }
}

// Instância singleton do serviço de roles
export const roleService = new RoleService();

// Funções de conveniência para compatibilidade
export const getRoles = (options?: RoleListOptions) => roleService.getRoles(options);
export const getRoleById = (id: string) => roleService.getRoleById(id);
export const createRole = (roleData: RoleCreateDto) => roleService.createRole(roleData);
export const updateRole = (id: string, roleData: RoleUpdateDto) => roleService.updateRole(id, roleData);
export const deleteRole = (id: string) => roleService.deleteRole(id);
export const getActiveRoles = () => roleService.getActiveRoles();
export const searchRolesByName = (name: string) => roleService.searchRolesByName(name);