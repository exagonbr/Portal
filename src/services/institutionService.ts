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
  active: boolean;
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
  active?: boolean;
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
  active?: boolean;
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
      if (params.filters.active !== undefined) queryParams.append('active', params.filters.active.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/institutions?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Falha ao buscar instituições');
    }

    return response.json();
  },

  async getInstitutionById(id: string): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/api/institutions/${id}`, {
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

    return response.json();
  },

  async createInstitution(data: Partial<Institution>): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/api/institutions`, {
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

    return response.json();
  },

  async updateInstitution(id: string, data: Partial<Institution>): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/api/institutions/${id}`, {
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

    return response.json();
  },

  async deleteInstitution(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/institutions/${id}`, {
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
    // Use the main institutions endpoint with a filter for active institutions
    const queryParams = new URLSearchParams({
      active: 'true',
      limit: '100' // Set a high limit to get all active institutions
    });
    
    const response = await fetch(`${API_BASE_URL}/api/institutions?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Falha ao buscar instituições ativas');
    }

    const result = await response.json();
    // Return just the items array from the paginated response
    return result.data.items;
  },

  async searchInstitutionsByName(name: string): Promise<Institution[]> {
    const queryParams = new URLSearchParams({
      search: name,
      active: 'true'
    });

    const response = await fetch(`${API_BASE_URL}/api/institutions/search?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Faça login novamente.');
      }
      throw new Error('Falha ao buscar instituições por nome');
    }

    return response.json();
  },

  async canDeleteInstitution(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/institutions/${id}/can-delete`, {
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

    return response.json();
  },

  async toggleInstitutionStatus(id: string, isActive: boolean): Promise<Institution> {
    const response = await fetch(`${API_BASE_URL}/api/institutions/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ active: isActive }),
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

    return response.json();
  },

  async exportInstitutions(filters?: InstitutionFilters): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.active !== undefined) queryParams.append('active', filters.active.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/institutions/export?${queryParams.toString()}`, {
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

    const response = await fetch(`${API_BASE_URL}/api/institutions/import`, {
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

    return response.json();
  }
};
