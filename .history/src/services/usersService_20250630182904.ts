import { apiClient, handleApiError, withRetry } from '@/lib/api-client';

// Tipos baseados na entidade Users do backend
export interface UsersResponseDto {
  id: number;
  version?: number;
  accountExpired?: boolean;
  accountLocked?: boolean;
  address?: string;
  amountOfMediaEntries?: number;
  dateCreated: string;
  deleted?: boolean;
  email: string;
  enabled?: boolean;
  fullName: string;
  invitationSent?: boolean;
  isAdmin: boolean;
  language?: string;
  lastUpdated: string;
  passwordExpired?: boolean;
  pauseVideoOnClick?: boolean;
  phone?: string;
  resetPassword: boolean;
  username?: string;
  uuid?: string;
  isManager: boolean;
  type?: number;
  certificatePath?: string;
  isCertified?: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  institutionId?: number;
  subject?: string;
  subjectDataId?: number;
  isInstitutionManage?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  roleId?: string;
  googleId?: string;
  // Campos enriquecidos
  role_name?: string;
  institution_name?: string;
  // Campos de compatibilidade com o frontend atual
  name: string; // Mapeado de fullName
  role_id?: string; // Mapeado de roleId
  institution_id?: number; // Mapeado de institutionId
  is_active: boolean; // Mapeado de enabled
  created_at: string; // Mapeado de dateCreated
  updated_at: string; // Mapeado de lastUpdated
  telefone?: string; // Mapeado de phone
  endereco?: string; // Mapeado de address
}

export interface CreateUsersDto {
  email: string;
  fullName: string;
  password?: string;
  isAdmin: boolean;
  isManager: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  roleId?: string;
  institutionId?: number;
  enabled?: boolean;
  resetPassword?: boolean;
  address?: string;
  phone?: string;
  username?: string;
  language?: string;
  googleId?: string;
}

export interface UpdateUsersDto {
  email?: string;
  fullName?: string;
  password?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  roleId?: string;
  institutionId?: number;
  enabled?: boolean;
  resetPassword?: boolean;
  address?: string;
  phone?: string;
  username?: string;
  language?: string;
  deleted?: boolean;
  accountLocked?: boolean;
  accountExpired?: boolean;
}

export interface UsersFilterDto {
  search?: string;
  name?: string;
  email?: string;
  role?: string;
  role_id?: string;
  roleId?: string;
  institution_id?: number;
  institutionId?: number;
  is_active?: boolean;
  enabled?: boolean;
  isAdmin?: boolean;
  isTeacher?: boolean;
  isStudent?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  created_after?: string;
  created_before?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'fullName' | 'email' | 'dateCreated' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

export interface UsersListResponse {
  items: UsersResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class UsersService {
  private readonly baseEndpoint = '/users';

  /**
   * Converte dados da entidade Users para formato compatível com o frontend
   */
  private mapUsersToFrontend(user: any): UsersResponseDto {
    return {
      ...user,
      // Mapeamentos para compatibilidade
      name: user.fullName || user.name,
      role_id: user.roleId || user.role_id,
      institution_id: user.institutionId || user.institution_id,
      is_active: user.enabled !== undefined ? user.enabled : user.is_active,
      created_at: user.dateCreated || user.created_at,
      updated_at: user.lastUpdated || user.updated_at,
      telefone: user.phone || user.telefone,
      endereco: user.address || user.endereco,
      // Manter campos originais também
      id: user.id,
      email: user.email,
      fullName: user.fullName || user.name,
      roleId: user.roleId || user.role_id,
      institutionId: user.institutionId || user.institution_id,
      enabled: user.enabled !== undefined ? user.enabled : user.is_active,
      dateCreated: user.dateCreated || user.created_at,
      lastUpdated: user.lastUpdated || user.updated_at,
      phone: user.phone || user.telefone,
      address: user.address || user.endereco,
      isAdmin: user.isAdmin || false,
      isManager: user.isManager || false,
      isStudent: user.isStudent || false,
      isTeacher: user.isTeacher || false,
      isCoordinator: user.isCoordinator || false,
      isGuardian: user.isGuardian || false,
      isInstitutionManager: user.isInstitutionManager || false,
      resetPassword: user.resetPassword || false,
      // Campos enriquecidos
      role_name: user.role_name,
      institution_name: user.institution_name
    };
  }

  /**
   * Converte dados do frontend para formato da entidade Users
   */
  private mapFrontendToUsers(data: any): any {
    return {
      ...data,
      fullName: data.name || data.fullName,
      roleId: data.role_id || data.roleId,
      institutionId: data.institution_id || data.institutionId,
      enabled: data.is_active !== undefined ? data.is_active : data.enabled,
      phone: data.telefone || data.phone,
      address: data.endereco || data.address
    };
  }

  /**
   * Lista todos os usuários com filtros e paginação
   */
  async getUsers(filters?: UsersFilterDto): Promise<UsersListResponse> {
    try {
      const filterParams = {
        page: 1,
        limit: 10,
        ...filters,
      };

      console.log('🔍 [UsersService] Buscando usuários com parâmetros:', filterParams);
      
      const response = await withRetry(() =>
        apiClient.get<ApiResponse<UsersResponseDto[]>>(this.baseEndpoint, filterParams as Record<string, string | number | boolean>)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar usuários');
      }

      console.log('📥 [UsersService] Resposta bruta da API:', {
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
        console.log('✅ [UsersService] Resposta já no formato correto');
        const listResponse = response.data as any;
        return {
          items: listResponse.items.map((user: any) => this.mapUsersToFrontend(user)),
          pagination: listResponse.pagination
        };
      }

      // Se response.data é um array direto, a API retornou todos os usuários sem paginação
      if (Array.isArray(response.data)) {
        console.log('⚠️ [UsersService] API retornou array direto sem paginação. Implementando paginação do lado do cliente.');
        
        const allUsers = response.data as any[];
        const page = filterParams.page;
        const limit = filterParams.limit;
        
        // Aplicar filtros do lado do cliente se necessário
        let filteredUsers = [...allUsers];
        
        // Filtro por nome
        if (filters?.name) {
          const nameQuery = filters.name.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            (user.fullName || user.name || '').toLowerCase().includes(nameQuery)
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
        if (filters?.role_id || filters?.roleId) {
          const roleId = filters.role_id || filters.roleId;
          filteredUsers = filteredUsers.filter(user => 
            user.roleId === roleId || user.role_id === roleId
          );
        }
        
        // Filtro por institution_id
        if (filters?.institution_id || filters?.institutionId) {
          const institutionId = filters.institution_id || filters.institutionId;
          filteredUsers = filteredUsers.filter(user => 
            user.institutionId === institutionId || user.institution_id === institutionId
          );
        }
        
        // Filtro por status ativo
        if (filters?.is_active !== undefined || filters?.enabled !== undefined) {
          const isActive = filters.is_active !== undefined ? filters.is_active : filters.enabled;
          filteredUsers = filteredUsers.filter(user => 
            (user.enabled !== undefined ? user.enabled : user.is_active) === isActive
          );
        }
        
        // Filtros por tipo de usuário
        if (filters?.isAdmin !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isAdmin === filters.isAdmin);
        }
        if (filters?.isTeacher !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isTeacher === filters.isTeacher);
        }
        if (filters?.isStudent !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isStudent === filters.isStudent);
        }
        if (filters?.isCoordinator !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isCoordinator === filters.isCoordinator);
        }
        if (filters?.isGuardian !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isGuardian === filters.isGuardian);
        }
        if (filters?.isInstitutionManager !== undefined) {
          filteredUsers = filteredUsers.filter(user => user.isInstitutionManager === filters.isInstitutionManager);
        }
        
        // Filtro por data de criação
        if (filters?.created_after) {
          const afterDate = new Date(filters.created_after);
          filteredUsers = filteredUsers.filter(user => 
            new Date(user.dateCreated || user.created_at) >= afterDate
          );
        }
        
        if (filters?.created_before) {
          const beforeDate = new Date(filters.created_before);
          filteredUsers = filteredUsers.filter(user => 
            new Date(user.dateCreated || user.created_at) <= beforeDate
          );
        }
        
        // Ordenação
        if (filters?.sortBy) {
          filteredUsers.sort((a, b) => {
            let aValue: any;
            let bValue: any;
            
            // Mapear campos de ordenação
            switch (filters.sortBy) {
              case 'name':
                aValue = a.fullName || a.name;
                bValue = b.fullName || b.name;
                break;
              case 'fullName':
                aValue = a.fullName || a.name;
                bValue = b.fullName || b.name;
                break;
              case 'dateCreated':
                aValue = new Date(a.dateCreated || a.created_at).getTime();
                bValue = new Date(b.dateCreated || b.created_at).getTime();
                break;
              case 'lastUpdated':
                aValue = new Date(a.lastUpdated || a.updated_at).getTime();
                bValue = new Date(b.lastUpdated || b.updated_at).getTime();
                break;
              default:
                aValue = a[filters.sortBy as keyof any];
                bValue = b[filters.sortBy as keyof any];
            }
            
            if (typeof aValue === 'string') {
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
        
        console.log('📊 [UsersService] Paginação do lado do cliente:', {
          totalUsuarios: total,
          paginaAtual: page,
          itensPorPagina: limit,
          totalPaginas: totalPages,
          indiceInicio: startIndex,
          indiceFim: endIndex,
          usuariosPaginados: paginatedUsers.length
        });
        
        return {
          items: paginatedUsers.map(user => this.mapUsersToFrontend(user)),
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
        console.log('🔄 [UsersService] Convertendo formato { data: [...] } para { items: [...] }');
        
        const apiData = response.data as any;
        return {
          items: (apiData.data || []).map((user: any) => this.mapUsersToFrontend(user)),
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
      console.warn('⚠️ [UsersService] Resposta da API não reconhecida, retornando estrutura vazia');
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
    } catch (error) {
      console.error('❌ [UsersService] Erro ao buscar usuários:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: number): Promise<UsersResponseDto> {
    try {
      const response = await withRetry(() =>
        apiClient.get<ApiResponse<any>>(`${this.baseEndpoint}/${id}`)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Usuário não encontrado');
      }

      return this.mapUsersToFrontend(response.data);
    } catch (error) {
      console.error(`[UsersService] Erro ao buscar usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cria novo usuário
   */
  async createUser(userData: CreateUsersDto): Promise<UsersResponseDto> {
    try {
      const mappedData = this.mapFrontendToUsers(userData);
      const response = await apiClient.post<ApiResponse<any>>(this.baseEndpoint, mappedData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao criar usuário');
      }

      // Cache invalidation would go here

      return this.mapUsersToFrontend(response.data);
    } catch (error) {
      console.error('[UsersService] Erro ao criar usuário:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: number, userData: UpdateUsersDto): Promise<UsersResponseDto> {
    try {
      const mappedData = this.mapFrontendToUsers(userData);
      const response = await apiClient.put<ApiResponse<any>>(`${this.baseEndpoint}/${id}`, mappedData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao atualizar usuário');
      }

      // Cache invalidation would go here

      return this.mapUsersToFrontend(response.data);
    } catch (error) {
      console.error(`[UsersService] Erro ao atualizar usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove usuário
   */
  async deleteUser(id: number): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`${this.baseEndpoint}/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao remover usuário');
      }

      // Cache invalidation would go here
    } catch (error) {
      console.error(`[UsersService] Erro ao remover usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuários por termo de pesquisa
   */
  async searchUsers(query: string, filters?: Partial<UsersFilterDto>): Promise<UsersListResponse> {
    try {
      const searchParams = {
        q: query,
        search: query,
        page: 1,
        limit: 10,
        ...filters,
      };
  
      console.log('🔍 [UsersService] Buscando usuários com termo:', query, 'e parâmetros:', searchParams);
  
      const response = await withRetry(() =>
        apiClient.get<ApiResponse<any[]>>(`${this.baseEndpoint}/search`, searchParams as Record<string, string | number | boolean>)
      );
  
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha na busca de usuários');
      }

      // Processar resposta similar ao getUsers
      if (Array.isArray(response.data)) {
        const allUsers = response.data;
        const page = (filters?.page as number) || 1;
        const limit = (filters?.limit as number) || 10;
        
        // Paginação do lado do cliente
        const total = allUsers.length;
        const totalPages = Math.ceil(total / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = allUsers.slice(startIndex, endIndex);
        
        return {
          items: paginatedUsers.map(user => this.mapUsersToFrontend(user)),
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

      throw new Error('Formato de resposta inválido');
    } catch (error) {
      console.error('❌ [UsersService] Erro na busca de usuários:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuário por email
   */
  async getUserByEmail(email: string): Promise<UsersResponseDto> {
    try {
      const response = await withRetry(() => 
        apiClient.get<ApiResponse<any>>(`${this.baseEndpoint}/by-email/${encodeURIComponent(email)}`)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Usuário não encontrado');
      }

      return this.mapUsersToFrontend(response.data);
    } catch (error) {
      console.error(`[UsersService] Erro ao buscar usuário por email ${email}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuário por username
   */
  async getUserByUsername(username: string): Promise<UsersResponseDto> {
    try {
      const response = await withRetry(() => 
        apiClient.get<ApiResponse<any>>(`${this.baseEndpoint}/by-username/${encodeURIComponent(username)}`)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Usuário não encontrado');
      }

      return this.mapUsersToFrontend(response.data);
    } catch (error) {
      console.error(`[UsersService] Erro ao buscar usuário por username ${username}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Ativa usuário
   */
  async activateUser(id: number): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<{ activated: boolean }>>(`${this.baseEndpoint}/${id}/activate`, {});

      if (!response.success) {
        throw new Error(response.message || 'Falha ao ativar usuário');
      }

      // Cache invalidation would go here
      return true;
    } catch (error) {
      console.error(`[UsersService] Erro ao ativar usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Desativa usuário
   */
  async deactivateUser(id: number): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<{ deactivated: boolean }>>(`${this.baseEndpoint}/${id}/deactivate`, {});

      if (!response.success) {
        throw new Error(response.message || 'Falha ao desativar usuário');
      }

      // Cache invalidation would go here
      return true;
    } catch (error) {
      console.error(`[UsersService] Erro ao desativar usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reseta senha do usuário
   */
  async resetPassword(id: number): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<{ reset: boolean }>>(`${this.baseEndpoint}/${id}/reset-password`, {});

      if (!response.success) {
        throw new Error(response.message || 'Falha ao resetar senha');
      }

      return true;
    } catch (error) {
      console.error(`[UsersService] Erro ao resetar senha do usuário ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Obtém estatísticas de usuários
   */
  async getUserStats(): Promise<{
    total: number;
    admins: number;
    teachers: number;
    students: number;
    guardians: number;
    coordinators: number;
    managers: number;
  }> {
    try {
      const response = await withRetry(() =>
        apiClient.get<ApiResponse<any>>(`${this.baseEndpoint}/stats`)
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar estatísticas');
      }

      return response.data;
    } catch (error) {
      console.error('[UsersService] Erro ao buscar estatísticas de usuários:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca usuários por role ID
   */
  async getUsersByRole(roleId: string): Promise<UsersResponseDto[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`${this.baseEndpoint}/by-role/${roleId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar usuários da função');
      }
      
      return (Array.isArray(response.data) ? response.data : []).map((user: any) => this.mapUsersToFrontend(user));
    } catch (error) {
      console.error(`[UsersService] Erro ao buscar usuários da role ${roleId}:`, error);
      return []; // Retorna array vazio em caso de erro
    }
  }

  /**
   * Busca usuários por instituição
   */
  async getUsersByInstitution(institutionId: number): Promise<UsersResponseDto[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`${this.baseEndpoint}/by-institution/${institutionId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar usuários da instituição');
      }
      
      return (Array.isArray(response.data) ? response.data : []).map((user: any) => this.mapUsersToFrontend(user));
    } catch (error) {
      console.error(`[UsersService] Erro ao buscar usuários da instituição ${institutionId}:`, error);
      return [];
    }
  }

  /**
   * Busca administradores
   */
  async getAdmins(): Promise<UsersResponseDto[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`${this.baseEndpoint}/admins`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar administradores');
      }
      
      return (Array.isArray(response.data) ? response.data : []).map((user: any) => this.mapUsersToFrontend(user));
    } catch (error) {
      console.error('[UsersService] Erro ao buscar administradores:', error);
      return [];
    }
  }

  /**
   * Busca professores
   */
  async getTeachers(): Promise<UsersResponseDto[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`${this.baseEndpoint}/teachers`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar professores');
      }
      
      return (Array.isArray(response.data) ? response.data : []).map((user: any) => this.mapUsersToFrontend(user));
    } catch (error) {
      console.error('[UsersService] Erro ao buscar professores:', error);
      return [];
    }
  }

  /**
   * Busca estudantes
   */
  async getStudents(): Promise<UsersResponseDto[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`${this.baseEndpoint}/students`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar estudantes');
      }
      
      return (Array.isArray(response.data) ? response.data : []).map((user: any) => this.mapUsersToFrontend(user));
    } catch (error) {
      console.error('[UsersService] Erro ao buscar estudantes:', error);
      return [];
    }
  
    /**
     * Exporta usuários
     */
    async exportUsers(filters?: UsersFilterDto, format: 'csv' | 'xlsx' = 'csv'): Promise<{ success: boolean; message: string }> {
      try {
        const response = await apiClient.post<ApiResponse<{ jobId: string }>>(`${this.baseEndpoint}/export`, {
          filters,
          format
        });
  
        if (!response.success) {
          throw new Error(response.message || 'Falha ao iniciar exportação');
        }
  
        return { success: true, message: 'Exportação iniciada com sucesso' };
      } catch (error) {
        console.error('[UsersService] Erro ao exportar usuários:', error);
        throw new Error(handleApiError(error));
      }
    }
  
    /**
     * Importa usuários
     */
    async importUsers(file: File): Promise<{ success: boolean; message: string }> {
      try {
        const formData = new FormData();
        formData.append('file', file);
  
        const response = await apiClient.post<ApiResponse<{ jobId: string }>>(`${this.baseEndpoint}/import`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        if (!response.success) {
          throw new Error(response.message || 'Falha ao iniciar importação');
        }
  
        return { success: true, message: 'Importação iniciada com sucesso' };
      } catch (error) {
        console.error('[UsersService] Erro ao importar usuários:', error);
        throw new Error(handleApiError(error));
      }
    }
  }
  
  // Instância singleton do serviço
  export const usersService = new UsersService();
  }

  /**
   * Busca coordenadores
   */
  async getCoordinators(): Promise<UsersResponseDto[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>(`${this.baseEndpoint}/coordinators`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar coordenadores');
      }
      
      return (Array.isArray(response.data) ? response.data : []).map((user: any) => this.mapUsersToFrontend(user));
    } catch (error) {
      console.error('[UsersService] Erro ao buscar coordenadores:', error);
      return [];
    }
  }