import { apiClient, handleApiError, withRetry } from '@/lib/api-client';
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

interface UserListParams extends PaginationParams {
  query?: string;
}

export class UserService {
  private readonly baseEndpoint = '/api/user';

  /**
   * Lista todos os usuários com filtros e paginação
   */
  async getUsers(filters?: UserFilterDto): Promise<ListResponse<UserResponseDto>> {
    try {
      const filterParams = {
        page: 1,
        limit: 10,
        ...filters,
      };

      const cacheKey = CacheKeys.USER_LIST(JSON.stringify(filterParams));
      
      // O cache está desativado para debug, mas a estrutura está aqui
      // return await withCache(cacheKey, async () => {
      
      console.log('🔍 Buscando usuários com parâmetros:', filterParams);
      
      const response = await withRetry(() =>
        apiClient.get<ListResponse<UserResponseDto>>(this.baseEndpoint, filterParams as Record<string, string | number | boolean>)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar usuários');
      }

      // Log detalhado da resposta para debug
      console.log('📥 Resposta bruta da API no userService:', {
        success: response.success,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        hasItems: !!(response.data as any)?.items,
        hasPagination: !!(response.data as any)?.pagination || !!response.pagination,
        responseKeys: Object.keys(response.data || {}),
        paginationInfo: (response.data as any)?.pagination || response.pagination
      });

      // Verifica se a resposta já está no formato correto { items: [...], pagination: {...} }
      if (response.data && typeof response.data === 'object' && 'items' in response.data && 'pagination' in response.data) {
        console.log('✅ Resposta já no formato correto');
        return response.data as ListResponse<UserResponseDto>;
      }

      // Se response.data é um array direto, a API retornou todos os usuários sem paginação
      if (Array.isArray(response.data)) {
        console.log('⚠️ API retornou array direto sem paginação. Implementando paginação do lado do cliente.');
        
        const allUsers = response.data as UserResponseDto[];
        const page = filterParams.page;
        const limit = filterParams.limit;
        
        // Aplicar filtros do lado do cliente se necessário
        let filteredUsers = [...allUsers];
        
        // Filtro por nome
        if (filters?.name) {
          const nameQuery = filters.name.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(nameQuery)
          );
        }
        
        // Filtro por email
        if (filters?.email) {
          const emailQuery = filters.email.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.email.toLowerCase().includes(emailQuery)
          );
        }
        
        // Filtro por role_id
        if (filters?.role_id) {
          filteredUsers = filteredUsers.filter(user => 
            user.role_id === filters.role_id
          );
        }
        
        // Filtro por institution_id
        if (filters?.institution_id) {
          filteredUsers = filteredUsers.filter(user => 
            user.institution_id === filters.institution_id
          );
        }
        
        // Filtro por status ativo
        if (filters?.is_active !== undefined) {
          filteredUsers = filteredUsers.filter(user => 
            user.is_active === filters.is_active
          );
        }
        
        // Filtro por data de criação
        if (filters?.created_after) {
          const afterDate = new Date(filters.created_after);
          filteredUsers = filteredUsers.filter(user => 
            new Date(user.created_at) >= afterDate
          );
        }
        
        if (filters?.created_before) {
          const beforeDate = new Date(filters.created_before);
          filteredUsers = filteredUsers.filter(user => 
            new Date(user.created_at) <= beforeDate
          );
        }
        
        // Ordenação
        if (filters?.sortBy) {
          filteredUsers.sort((a, b) => {
            let aValue: any = a[filters.sortBy as keyof UserResponseDto];
            let bValue: any = b[filters.sortBy as keyof UserResponseDto];
            
            // Tratamento especial para datas
            if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
              aValue = new Date(aValue).getTime();
              bValue = new Date(bValue).getTime();
            } else if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
            if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
            return 0;
          });
        }
        
        // Paginação do lado do cliente
        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        console.log('📊 Paginação do lado do cliente:', {
          totalUsuarios: total,
          paginaAtual: page,
          itensPorPagina: limit,
          totalPaginas: totalPages,
          indiceInicio: startIndex,
          indiceFim: endIndex,
          usuariosPaginados: paginatedUsers.length
        });
        
        const convertedResponse: ListResponse<UserResponseDto> = {
          items: paginatedUsers,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        };
        
        console.log('✅ Resposta convertida com paginação do lado do cliente');
        return convertedResponse;
      }
      
      // Se response.data tem a estrutura { data: [...] } (formato alternativo da API)
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        console.log('🔄 Convertendo formato { data: [...] } para { items: [...] }');
        
        const apiData = response.data as any;
        return {
          items: apiData.data || [],
          pagination: apiData.pagination || response.pagination || {
            page: filterParams.page,
            limit: filterParams.limit,
            total: apiData.total || apiData.data?.length || 0,
            totalPages: Math.ceil((apiData.total || apiData.data?.length || 0) / filterParams.limit),
            hasNext: false,
            hasPrev: filterParams.page > 1
          }
        };
      }
      
      // Fallback para resposta vazia
      console.warn('⚠️ Resposta da API não reconhecida, retornando estrutura vazia');
      return {
        items: [],
        pagination: {
          page: filterParams.page,
          limit: filterParams.limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: filterParams.page > 1
        }
      };
      // }, CacheTTL.MEDIUM);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      
      // Se o erro for específico sobre a estrutura da resposta, tenta usar dados simulados
      if (error instanceof Error &&
          (error.message.includes('lista de usuários esperada') ||
           error.message.includes('não contém') ||
           error.message.includes('undefined'))) {
        console.warn('Erro na estrutura da resposta. Retornando dados simulados para desenvolvimento.');
        return this.mockUserList({
          page: filters?.page || 1,
          limit: filters?.limit || 10
          // Não passamos query pois não existe em UserFilterDto
        });
      }
      
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
        page: 1,
        limit: 10,
        ...filters,
      };
  
      console.log('🔍 Buscando usuários com termo:', query, 'e parâmetros:', searchParams);
  
      const response = await withRetry(() =>
        apiClient.get<ApiResponse<UserResponseDto[]>>(`${this.baseEndpoint}/search`, searchParams as Record<string, string | number | boolean>)
      );
  
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha na busca de usuários');
      }

      console.log('📥 Resposta da busca de usuários:', {
        success: response.success,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        hasItems: !!(response.data as any)?.items,
        hasPagination: !!(response.data as any)?.pagination || !!response.pagination
      });

      // Verifica se a resposta já está no formato correto { items: [...], pagination: {...} }
      if (response.data && typeof response.data === 'object' && 'items' in response.data && 'pagination' in response.data) {
        console.log('✅ Resposta da busca já no formato correto');
        return response.data as ListResponse<UserResponseDto>;
      }

      // Se response.data é um array direto, implementa paginação do lado do cliente
      if (Array.isArray(response.data)) {
        console.log('⚠️ API de busca retornou array direto sem paginação. Implementando paginação do lado do cliente.');
        
        const allUsers = response.data as UserResponseDto[];
        const page = (filters?.page as number) || 1;
        const limit = (filters?.limit as number) || 10;
        
        // Aplicar filtros adicionais do lado do cliente se necessário
        let filteredUsers = [...allUsers];
        
        // Filtro por role_id
        if (filters?.role_id) {
          filteredUsers = filteredUsers.filter(user => 
            user.role_id === filters.role_id
          );
        }
        
        // Filtro por institution_id
        if (filters?.institution_id) {
          filteredUsers = filteredUsers.filter(user => 
            user.institution_id === filters.institution_id
          );
        }
        
        // Filtro por status ativo
        if (filters?.is_active !== undefined) {
          filteredUsers = filteredUsers.filter(user => 
            user.is_active === filters.is_active
          );
        }
        
        // Ordenação
        if (filters?.sortBy) {
          filteredUsers.sort((a, b) => {
            let aValue: any = a[filters.sortBy as keyof UserResponseDto];
            let bValue: any = b[filters.sortBy as keyof UserResponseDto];
            
            // Tratamento especial para datas
            if (filters.sortBy === 'created_at' || filters.sortBy === 'updated_at') {
              aValue = new Date(aValue).getTime();
              bValue = new Date(bValue).getTime();
            } else if (typeof aValue === 'string') {
              aValue = aValue.toLowerCase();
              bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
            if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
            return 0;
          });
        }
        
        // Paginação do lado do cliente
        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        
        console.log('📊 Paginação da busca do lado do cliente:', {
          termoBusca: query,
          totalUsuarios: total,
          paginaAtual: page,
          itensPorPagina: limit,
          totalPaginas: totalPages,
          usuariosPaginados: paginatedUsers.length
        });
        
        return {
          items: paginatedUsers,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        };
      }

      // Se response.data tem a estrutura { data: [...] } (formato alternativo da API)
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        console.log('🔄 Convertendo formato de busca { data: [...] } para { items: [...] }');
        
        const apiData = response.data as any;
        const page = (filters?.page as number) || 1;
        const limit = (filters?.limit as number) || 10;
        
        return {
          items: apiData.data || [],
          pagination: apiData.pagination || response.pagination || {
            page,
            limit,
            total: apiData.total || apiData.data?.length || 0,
            totalPages: Math.ceil((apiData.total || apiData.data?.length || 0) / limit),
            hasNext: false,
            hasPrev: page > 1
          }
        };
      }

      throw new Error('Formato de resposta inválido');
    } catch (error) {
      console.error('❌ Erro na busca de usuários:', error);
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

  /**
   * Lista todos os usuários globais com paginação
   */
  async listGlobalUsers(params: UserListParams = {}): Promise<ListResponse<UserResponseDto>> {
    try {
      const queryParams = {
        ...params,
        query: params.query || undefined
      } as Record<string, string | number | boolean>;

      const response = await apiClient.get<ListResponse<UserResponseDto>>('/api/user', queryParams);
      if (!response.success || !response.data?.items) {
        throw new Error(response.message || 'Falha ao buscar usuários');
      }
      
      // Ensure pagination is defined
      if (!response.data.pagination) {
        // Alerta quando há muitos itens sem paginação
        if (response.data.items.length > 100) {
          console.warn(`Atenção: API global retornou ${response.data.items.length} itens sem paginação. Isso pode causar problemas de performance.`);
        }
        
        // Limita o número de itens retornados quando não há paginação
        const MAX_ITEMS_WITHOUT_PAGINATION = 100;
        let totalItems = response.data.items.length;
        
        if (response.data.items.length > MAX_ITEMS_WITHOUT_PAGINATION) {
          console.warn(`Limitando retorno global para ${MAX_ITEMS_WITHOUT_PAGINATION} itens dos ${response.data.items.length} retornados pela API.`);
          response.data.items = response.data.items.slice(0, MAX_ITEMS_WITHOUT_PAGINATION);
        }
        
        response.data.pagination = {
          page: params.page || 1,
          limit: params.limit || 10,
          total: totalItems,
          totalPages: Math.ceil(totalItems / (params.limit || 10)),
          hasNext: totalItems > MAX_ITEMS_WITHOUT_PAGINATION,
          hasPrev: (params.page || 1) > 1
        };
      }
      
      return response.data;
    } catch (error) {
      // Para fins de desenvolvimento, retornamos dados simulados em caso de erro
      console.warn('API não disponível, retornando dados simulados');
      return this.mockUserList(params);
    }
  }

  /**
   * Gera uma lista de usuários de exemplo para desenvolvimento
   */
  private mockUserList(params: UserListParams = {}): ListResponse<UserResponseDto> {
    const mockUsers: UserResponseDto[] = Array.from({ length: 10 }).map((_, index) => ({
      id: `user-${index + 1}`,
      name: `Usuário de Teste ${index + 1}`,
      email: `usuario${index + 1}@exemplo.com`,
      role_id: index % 3 === 0 ? 'role-1' : index % 3 === 1 ? 'role-2' : 'role-3',
      is_active: true,
      institution_id: 'inst-1',
      endereco: `Endereço ${index + 1}`,
      telefone: `(11) 9999-000${index}`,
      school_id: undefined,
      created_at: new Date(Date.now() - index * 86400000).toISOString(),
      updated_at: new Date(Date.now() - index * 86400000).toISOString()
    }));

    // Filtragem simulada
    let filteredUsers = [...mockUsers];
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredUsers = filteredUsers.filter(
        user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
      );
    }

    // Paginação simulada
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return {
      items: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Gera um usuário de exemplo para desenvolvimento
   */
  private mockUser(id: string): UserResponseDto {
    return {
      id,
      name: 'Usuário de Teste',
      email: `usuario-${id}@exemplo.com`,
      role_id: 'role-1',
      is_active: true,
      institution_id: 'inst-1',
      endereco: 'Endereço de Teste',
      telefone: '(11) 99999-0000',
      school_id: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Solicita reset de senha para um usuário
   */
  async resetPassword(userId: string): Promise<void> {
    try {
      const response = await apiClient.post<{ success: boolean }>(`${this.baseEndpoint}/${userId}/reset-password`, {});

      if (!response.success) {
        throw new Error(response.message || 'Falha ao resetar senha do usuário');
      }
    } catch (error) {
      console.error(`Erro ao resetar senha do usuário ${userId}:`, error);
      throw new Error(handleApiError(error));
    }
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
export const resetUserPassword = (userId: string) => userService.resetPassword(userId);