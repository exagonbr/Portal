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

export interface InstitutionQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: string;
  is_active?: boolean;
}

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
  async getInstitutions(params: InstitutionQueryParams = {}): Promise<PaginatedResponse<Institution>> {
    const queryParams = new URLSearchParams();
    
    // Add query parameters if they exist
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

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
};
