import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client';
import { cacheService } from './cacheService';
import { queueService, JobTypes } from './queueService';
import {
  RoleResponseDto,
  RoleCreateDto,
  RoleUpdateDto,
  RoleFilterDto,
  PaginatedResponseDto,
  ApiResponse
} from '../types/api';
import { Logger } from '../utils/Logger';
import { ServiceResult } from '../types/common';
import { debugAuthState } from '../utils/auth-debug';

export interface RoleFilters {
  name?: string;
  description?: string;
  active?: boolean;
  status?: 'active' | 'inactive';
  search?: string;
  type?: string;
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
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger('RoleService');
  }

  
  /**
   * Busca todas as roles com paginação e filtros
   * @param options Opções de paginação, ordenação e filtros
   * @returns Promise<PaginatedResponseDto<RoleResponseDto>> Lista paginada de roles
   * @throws Error se houver falha ao buscar roles
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

      // Validação dos parâmetros
      if (page < 1) throw new Error('Página deve ser maior que 0');
      if (limit < 1 || limit > 100) throw new Error('Limite deve estar entre 1 e 100');
      if (!['name', 'created_at', 'updated_at', 'user_count'].includes(sortBy)) {
        throw new Error('Campo de ordenação inválido');
      }
      if (!['asc', 'desc'].includes(sortOrder)) {
        throw new Error('Ordem de classificação inválida');
      }

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

        const response = await apiClient.get<any>(
          this.baseEndpoint,
          searchParams
        );

        if (!response.success) {
          throw new Error(response.message || 'Falha ao buscar roles');
        }

        // A API local retorna { success: true, data: [...] } para acesso público
        // ou { success: true, data: { items: [...], pagination: {...} } } para acesso autenticado
        let items: RoleResponseDto[] = [];
        let total = 0;

        if (Array.isArray(response.data)) {
          // Resposta pública: array direto
          items = response.data;
          total = items.length;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          // Resposta paginada
          items = response.data.items;
          total = response.data.total || response.data.pagination?.total || items.length;
        } else if (response.data?.data) {
          // Resposta aninhada
          if (Array.isArray(response.data.data)) {
            items = response.data.data;
            total = items.length;
          } else if (response.data.data.items) {
            items = response.data.data.items;
            total = response.data.data.total || response.data.data.pagination?.total || items.length;
          }
        }

        // Garante que a resposta tem a estrutura correta
        const paginatedResponse: PaginatedResponseDto<RoleResponseDto> = {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
          },
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        };

        // Validação adicional da resposta
        if (!Array.isArray(paginatedResponse.items)) {
          this.logger.warn('Resposta inválida: items não é um array');
          paginatedResponse.items = [];
        }

        return paginatedResponse;
      }, CacheTTL.MEDIUM);
    } catch (error) {
      this.logger.error('Erro ao buscar roles:', error);
      
      // Debug do estado da autenticação quando há erro
      if (error instanceof ApiClientError && error.status === 401) {
        this.logger.debug('Erro 401 detectado, verificando estado da autenticação...');
        debugAuthState();
      }
      
      if (error instanceof ApiClientError) {
        if (error.status === 401) {
          throw new Error('Não autorizado a buscar roles');
        }
        if (error.status === 403) {
          throw new Error('Sem permissão para buscar roles');
        }
        if (error.status === 400) {
          throw new Error(error.errors?.join(', ') || 'Parâmetros inválidos');
        }
      }
      
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage === 'Failed to retrieve roles') {
        throw new Error('Falha ao buscar roles');
      } else {
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * Busca role por ID
   */
  async getRoleById(id: string): Promise<RoleResponseDto> {
    try {
      if (!id?.trim()) {
        throw new Error('ID da role é obrigatório');
      }

      const cacheKey = CacheKeys.ROLE_BY_ID(id);

      return await withCache(cacheKey, async () => {
        const response = await apiClient.get<ApiResponse<RoleResponseDto>>(`${this.baseEndpoint}/${id}`);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Role não encontrada');
        }

        // Garante que todos os campos obrigatórios estão presentes
        const role: RoleResponseDto = {
          id: response.data.data?.id || '',
          name: response.data.data?.name || '',
          description: response.data.data?.description,
          active: response.data.data?.active ?? true,
          users_count: response.data.data?.users_count || 0,
          created_at: response.data.data?.created_at || new Date().toISOString(),
          updated_at: response.data.data?.updated_at || new Date().toISOString(),
          status: ''
        };

        return role;
      }, CacheTTL.MEDIUM);
    } catch (error) {
      console.error(`Erro ao buscar role ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Role não encontrada');
        }
        if (error.status === 400) {
          throw new Error('ID da role inválido');
        }
      }
      
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage === 'Failed to retrieve role') {
        throw new Error('Falha ao buscar role');
      } else {
        throw new Error(errorMessage);
      }
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
      
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Failed to')) {
        throw new Error('Falha ao criar role');
      } else {
        throw new Error(errorMessage);
      }
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
      
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Failed to')) {
        throw new Error('Falha ao atualizar role');
      } else {
        throw new Error(errorMessage);
      }
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
      
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Failed to')) {
        throw new Error('Falha ao deletar role');
      } else {
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * Busca roles ativas (para dropdowns e seletores)
   * @returns Promise<RoleResponseDto[]> Lista de roles ativas ordenadas por nome
   * @throws Error se houver falha ao buscar roles
   */
  async getActiveRoles(): Promise<RoleResponseDto[]> {
    try {
      this.logger.debug('Buscando roles ativas...');

      // Tentar acesso público primeiro para evitar problemas de autenticação
      let response = await apiClient.get<any>(this.baseEndpoint, {
        public: 'true',
        active: true,
        status: 'active',
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc'
      }).catch(error => {
        this.logger.warn('Falha na requisição pública, tentando autenticada...', error);
        return null;
      });

      // Se falhar, tentar com autenticação normal
      if (!response || !response.success) {
        this.logger.debug('Tentando acesso autenticado a roles...');
        response = await apiClient.get<any>(this.baseEndpoint, {
          active: true,
          status: 'active',
          limit: 100,
          sortBy: 'name',
          sortOrder: 'asc'
        });
      }

      this.logger.debug('Resposta da API de roles:', {
        success: response.success,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        hasItems: !!(response.data?.items || response.data?.data?.items),
        responseStructure: response.data,
        message: response.message,
        errors: response.errors
      });

      if (!response.success) {
        // Tratamento mais detalhado do erro
        let errorMessage = 'Falha ao buscar roles';
        
        if (response.message) {
          errorMessage = response.message;
        } else if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          errorMessage = response.errors.join(', ');
        }
        
        this.logger.error('API retornou erro:', {
          message: response.message,
          errors: response.errors,
          finalErrorMessage: errorMessage
        });
        
        throw new Error(errorMessage);
      }

      // Tentar diferentes estruturas de resposta
      let roles: RoleResponseDto[] = [];
      
      if (response.data?.items && Array.isArray(response.data.items)) {
        // Estrutura: { items: [...] }
        roles = response.data.items;
        this.logger.debug('Usando estrutura response.data.items');
      } else if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        // Estrutura: { data: { items: [...] } }
        roles = response.data.data.items;
        this.logger.debug('Usando estrutura response.data.data.items');
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Estrutura: { data: [...] }
        roles = response.data.data;
        this.logger.debug('Usando estrutura response.data.data (array direto)');
      } else if (Array.isArray(response.data)) {
        // Estrutura: [...] (array direto)
        roles = response.data;
        this.logger.debug('Usando estrutura response.data (array direto)');
      } else {
        this.logger.warn('Estrutura de resposta não reconhecida:', response.data);
        return [];
      }

      // Filtrar apenas roles ativas
      const activeRoles = roles.filter(role => {
        // Verificar diferentes campos que podem indicar se a role está ativa
        const isActive = role.active !== false && 
                         role.status !== 'inactive' && 
                         role.status !== 'disabled';
        return isActive;
      });

      this.logger.debug(`Encontradas ${activeRoles.length} roles ativas de ${roles.length} total`);
      
      return activeRoles;

    } catch (error) {
      this.logger.error('Erro ao buscar roles ativas:', error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 401) {
          throw new Error('Não autorizado a buscar roles');
        }
        if (error.status === 403) {
          throw new Error('Sem permissão para buscar roles');
        }
      }
      
      // Garantindo que a mensagem de erro está em português
      throw new Error('Falha ao recuperar roles');
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
      
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Failed to')) {
        throw new Error('Falha ao alterar status da role');
      } else {
        throw new Error(errorMessage);
      }
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
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Failed to')) {
        throw new Error('Falha ao buscar estatísticas das roles');
      } else {
        throw new Error(errorMessage);
      }
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
      
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Failed to')) {
        throw new Error('Falha ao duplicar role');
      } else {
        throw new Error(errorMessage);
      }
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
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Failed to')) {
        throw new Error('Falha ao exportar roles');
      } else {
        throw new Error(errorMessage);
      }
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
      // Traduz a mensagem de erro para português
      const errorMessage = handleApiError(error);
      if (errorMessage.includes('Failed to')) {
        throw new Error('Falha ao importar roles');
      } else {
        throw new Error(errorMessage);
      }
    }
  }

  /**
   * Busca permissões de uma role
   */
  async getPermissionsForRole(roleId: string): Promise<any> {
    try {
      const cacheKey = CacheKeys.ROLE_PERMISSIONS(roleId);
      
      return await withCache(cacheKey, async () => {
        const response = await apiClient.get<ApiResponse<any>>(`${this.baseEndpoint}/${roleId}/permissions`);
        
        if (!response.success || !response.data) {
          this.logger.warn(`Permissões não encontradas para role ${roleId}`);
          return {
            roleId,
            roleName: '',
            permissionGroups: [],
            totalPermissions: 0,
            enabledPermissions: 0
          };
        }
        
        return response.data.data || {
          roleId,
          roleName: '',
          permissionGroups: [],
          totalPermissions: 0,
          enabledPermissions: 0
        };
      }, CacheTTL.MEDIUM);
    } catch (error) {
      this.logger.error(`Erro ao buscar permissões para role ${roleId}`, error);
      return {
        roleId,
        roleName: '',
        permissionGroups: [],
        totalPermissions: 0,
        enabledPermissions: 0
      };
    }
  }

  /**
   * Busca todos os roles com filtros e paginação
   */
  async findRolesWithFilters(filters: RoleFilterDto): Promise<ServiceResult<{ roles: RoleResponseDto[], pagination: any }>> {
    try {
      const { page = 1, limit = 10, type, status, search, sortBy = 'name', sortOrder = 'asc', active } = filters;

      this.logger.debug('findRolesWithFilters - Filtros recebidos:', { filters });

      // Construir parâmetros da query
      const queryParams: Record<string, any> = {
        page,
        limit,
        sortBy,
        sortOrder
      };

      if (type) queryParams.type = type;
      if (status) queryParams.status = status;
      if (active !== undefined) queryParams.active = active;
      if (search) queryParams.search = search;

      // Fazer chamada à API
      const response = await apiClient.get<PaginatedResponseDto<RoleResponseDto>>(
        this.baseEndpoint,
        queryParams
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar roles');
      }

      return {
        success: true,
        data: {
          roles: response.data.items,
          pagination: {
            page: response.data.page,
            limit: response.data.limit,
            total: response.data.total,
            totalPages: response.data.totalPages,
            hasNext: response.data.hasNext,
            hasPrev: response.data.hasPrev
          }
        }
      };

    } catch (error) {
      this.logger.error('Erro ao buscar roles com filtros', error as Error);
      return {
        success: false,
        error: 'Falha ao buscar roles'
      };
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