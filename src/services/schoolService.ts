import { apiClient } from '@/lib/api-client';

export interface School {
  id: string;
  name: string;
  code?: string;
  institution_id: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  status?: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  // Campos adicionais para compatibilidade
  active?: boolean;
  institutionName?: string;
  principal?: string;
  studentsCount?: number;
  teachersCount?: number;
  classesCount?: number;
}

export interface CreateSchoolData {
  name: string;
  code?: string;
  institution_id: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateSchoolData {
  name?: string;
  code?: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface SchoolFilter {
  page?: number;
  limit?: number;
  search?: string;
  institution_id?: string;
  is_active?: boolean;
  type?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const schoolService = {
  // Listar escolas com paginação
  async list(filter?: SchoolFilter): Promise<PaginatedResponse<School>> {
    try {
      const params: Record<string, string | number | boolean> = {};
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<any>('/api/schools', params);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao buscar escolas');
      }

      // Normalizar resposta para o formato esperado
      let schools: School[] = [];
      let pagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };

      if (response.data) {
        if (response.data.items) {
          schools = response.data.items;
          pagination = response.data.pagination || pagination;
        } else if (Array.isArray(response.data)) {
          schools = response.data;
          pagination.total = schools.length;
        }
      }

      // Normalizar campos para compatibilidade
      const normalizedSchools = schools.map(school => ({
        ...school,
        active: school.is_active,
        status: school.is_active ? 'active' as const : 'inactive' as const,
        studentsCount: school.studentsCount || 0,
        teachersCount: school.teachersCount || 0,
        classesCount: school.classesCount || 0
      }));

      return {
        items: normalizedSchools,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages
      };
    } catch (error) {
      console.error('Erro ao listar escolas:', error);
      throw error;
    }
  },

  // Buscar escola por ID
  async getById(id: string): Promise<School> {
    try {
      const response = await apiClient.get<any>(`/api/schools/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Escola não encontrada');
      }

      const school = response.data;

      return {
        ...school,
        active: school.is_active,
        status: school.is_active ? 'active' : 'inactive'
      };
    } catch (error) {
      console.error('Erro ao buscar escola:', error);
      throw error;
    }
  },

  // Criar escola
  async create(data: CreateSchoolData): Promise<School> {
    try {
      const response = await apiClient.post<any>('/api/schools', data);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao criar escola');
      }

      const school = response.data;

      return {
        ...school,
        active: school.is_active,
        status: school.is_active ? 'active' : 'inactive'
      };
    } catch (error) {
      console.error('Erro ao criar escola:', error);
      throw error;
    }
  },

  // Atualizar escola
  async update(id: string, data: UpdateSchoolData): Promise<School> {
    try {
      const response = await apiClient.put<any>(`/api/schools/${id}`, data);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao atualizar escola');
      }

      const school = response.data;

      return {
        ...school,
        active: school.is_active,
        status: school.is_active ? 'active' : 'inactive'
      };
    } catch (error) {
      console.error('Erro ao atualizar escola:', error);
      throw error;
    }
  },

  // Deletar escola
  async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<any>(`/api/schools/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao deletar escola');
      }
    } catch (error) {
      console.error('Erro ao deletar escola:', error);
      throw error;
    }
  },

  // Buscar escolas por instituição
  async getByInstitution(institutionId: string): Promise<School[]> {
    try {
      const response = await this.list({ institution_id: institutionId, limit: 100 });
      return response.items;
    } catch (error) {
      console.error('Erro ao buscar escolas por instituição:', error);
      throw error;
    }
  }
};