import { API_BASE_URL } from '../config/constants';

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InstitutionFilters {
  type?: string;
  is_active?: boolean;
  search?: string;
}

export interface InstitutionListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: InstitutionFilters;
}

export type InstitutionQueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: string;
  is_active?: boolean;
};

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try to get token from localStorage (matches auth service)
  return localStorage.getItem('auth_token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const institutionService = {
  async getAll(): Promise<{ data: Institution[] }> {
    try {
      console.log('🔍 Buscando todas as instituições...');
      
      const queryParams = new URLSearchParams({
        limit: '100' // Set a high limit to get all institutions
      });
      
      const response = await fetch(`${API_BASE_URL}/institutions?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error(`❌ Erro HTTP ${response.status} ao buscar instituições`);
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        throw new Error(`Falha ao buscar instituições (HTTP ${response.status})`);
      }

      const result = await response.json();
      console.log('📥 Resposta da API de instituições:', result);
      
      // O backend retorna { success: true, data: [...] }
      if (result.success && result.data) {
        const institutions = Array.isArray(result.data) ? result.data : [];
        console.log(`✅ ${institutions.length} instituições encontradas`);
        return { data: institutions };
      }
      
      console.warn('⚠️ Estrutura de resposta não reconhecida:', result);
      return { data: [] };
      
    } catch (error) {
      console.error('❌ Erro ao buscar instituições:', error);
      throw error;
    }
  },

  async getInstitutions(params: InstitutionListOptions = {}): Promise<PaginatedResponse<Institution>> {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters if they exist
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    // Add sorting parameters if they exist
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // Add filter parameters if they exist
    if (params.filters) {
      if (params.filters.search) queryParams.append('search', params.filters.search);
      if (params.filters.type) queryParams.append('type', params.filters.type);
      if (params.filters.is_active !== undefined) queryParams.append('is_active', params.filters.is_active.toString());
    }

    const response = await fetch(`${API_BASE_URL}/institutions?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Falha ao buscar instituições');
    }

    const result = await response.json();
    
    // O backend retorna { success: true, data: [...], pagination: {...} }
    // Precisamos adaptar para a interface PaginatedResponse
    if (result.success && result.data && result.pagination) {
      return {
        data: result.data,
        pagination: {
          total: result.pagination.total,
          page: result.pagination.page,
          limit: result.pagination.limit,
          totalPages: result.pagination.totalPages
        }
      };
    }
    
    // Fallback para estrutura antiga ou inesperada
    throw new Error('Estrutura de resposta inválida da API');
  },

  async getInstitutionById(id: string): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      if (response.status === 404) {
        throw new Error('Instituição não encontrada');
      }
      throw new Error('Falha ao buscar instituição');
    }

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Estrutura de resposta inválida da API');
  },

  async createInstitution(data: Partial<Institution>): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Falha ao criar instituição');
    }

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Estrutura de resposta inválida da API');
  },

  async updateInstitution(id: string, data: Partial<Institution>): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      if (response.status === 404) {
        throw new Error('Instituição não encontrada');
      }
      throw new Error('Falha ao atualizar instituição');
    }

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Estrutura de resposta inválida da API');
  },

  async deleteInstitution(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      if (response.status === 404) {
        throw new Error('Instituição não encontrada');
      }
      throw new Error('Falha ao deletar instituição');
    }
  },

  async getActiveInstitutions(): Promise<Institution[]> {
    try {
      console.log('🔍 Buscando instituições ativas...');
      
      // Use the main institutions endpoint with a filter for active institutions
      const queryParams = new URLSearchParams({
        is_active: 'true',
        limit: '100' // Set a high limit to get all active institutions
      });
      
      const response = await fetch(`${API_BASE_URL}/institutions?${queryParams.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error(`❌ Erro HTTP ${response.status} ao buscar instituições ativas`);
        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }
        throw new Error(`Falha ao buscar instituições ativas (HTTP ${response.status})`);
      }

      const result = await response.json();
      console.log('📥 Resposta da API de instituições:', result);
      
      // O backend retorna { success: true, data: [...] }
      if (result.success && result.data) {
        const institutions = Array.isArray(result.data) ? result.data : [];
        console.log(`✅ ${institutions.length} instituições ativas encontradas`);
        return institutions.filter(inst => inst.is_active !== false);
      }
      
      console.warn('⚠️ Estrutura de resposta não reconhecida:', result);
      return [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar instituições ativas:', error);
      throw error;
    }
  },

  async searchInstitutionsByName(name: string): Promise<Institution[]> {
    const queryParams = new URLSearchParams({
      search: name,
      is_active: 'true'
    });

    const response = await fetch(`${API_BASE_URL}/institutions/search?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Falha ao buscar instituições por nome');
    }

    const result = await response.json();
    
    // O backend retorna { success: true, data: [...] }
    if (result.success && result.data) {
      return Array.isArray(result.data) ? result.data : [];
    }
    
    throw new Error('Estrutura de resposta inválida da API');
  },

  async canDeleteInstitution(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}/can-delete`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      if (response.status === 404) {
        throw new Error('Instituição não encontrada');
      }
      throw new Error('Falha ao verificar se a instituição pode ser excluída');
    }

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Estrutura de resposta inválida da API');
  },

  async toggleInstitutionStatus(id: string, isActive: boolean): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: isActive }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      if (response.status === 404) {
        throw new Error('Instituição não encontrada');
      }
      throw new Error('Falha ao alterar o status da instituição');
    }

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data;
    }
    
    throw new Error('Estrutura de resposta inválida da API');
  },

  async exportInstitutions(filters?: InstitutionFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());
    }

    const response = await fetch(`${API_BASE_URL}/institutions/export?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Falha ao exportar instituições');
    }

    return response.blob();
  },

  async importInstitutions(file: File): Promise<{ success: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/institutions/import`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Falha ao importar instituições');
    }

    const result = await response.json();
    
    // O backend retorna { success: true, data: {...} }
    if (result.success && result.data) {
      return result.data;
    }
    
    // Fallback para estrutura antiga
    return result;
  }
};
