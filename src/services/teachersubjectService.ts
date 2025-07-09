import { apiClient } from '@/lib/api-client';
import { BaseApiService } from './base-api-service';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

export interface TeacherSubject {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherSubjectDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTeacherSubjectDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface TeacherSubjectFilter {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedTeacherSubjectResponse {
  items: TeacherSubject[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Função para mapear resposta da API para o formato esperado
const mapToTeacherSubject = (data: any): TeacherSubject => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  isActive: data.isActive || data.is_active || false,
  createdAt: data.createdAt || data.created_at || new Date().toISOString(),
  updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
});

class TeacherSubjectService extends BaseApiService<TeacherSubject> {
  constructor() {
    super('/api/teacher-subjects');
  }

  async getTeacherSubjects(params: TeacherSubjectFilter): Promise<PaginatedTeacherSubjectResponse> {
    try {
      console.log('🔄 [TEACHER_SUBJECTS] Chamando API com parâmetros:', params);
      const response = await apiGet<any>('/teacher-subjects', params);
      console.log('✅ [TEACHER_SUBJECTS] Resposta da API:', response);
      
      // Verificar diferentes formatos de resposta
      let items: any[] = [];
      let total = 0;
      let page = params.page || 1;
      let limit = params.limit || 10;
      let totalPages = 0;

      if (response && response.items && Array.isArray(response.items)) {
        items = response.items;
        total = response.total || 0;
        page = response.page || page;
        limit = response.limit || limit;
        totalPages = response.totalPages || Math.ceil(total / limit);
      } else if (response && Array.isArray(response)) {
        items = response;
        total = response.length;
        totalPages = Math.ceil(total / limit);
      } else if (response && response.data && Array.isArray(response.data)) {
        items = response.data;
        total = response.total || response.data.length;
        totalPages = Math.ceil(total / limit);
      } else {
        console.warn('⚠️ [TEACHER_SUBJECTS] Formato de resposta não reconhecido:', response);
        items = [];
        total = 0;
        totalPages = 0;
      }

      return {
        items: items.map(mapToTeacherSubject),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('❌ [TEACHER_SUBJECTS] Erro ao buscar teacher subjects:', error);
      return {
        items: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: 0,
      };
    }
  }

  async getTeacherSubjectById(id: number): Promise<TeacherSubject> {
    const response = await apiGet<any>(`/teacher-subjects/${id}`);
    return mapToTeacherSubject(response);
  }

  async createTeacherSubject(data: CreateTeacherSubjectDto): Promise<TeacherSubject> {
    const response = await apiPost<any>('/teacher-subjects', data);
    return mapToTeacherSubject(response);
  }

  async updateTeacherSubject(id: number, data: UpdateTeacherSubjectDto): Promise<TeacherSubject> {
    const response = await apiPut<any>(`/teacher-subjects/${id}`, data);
    return mapToTeacherSubject(response);
  }

  async deleteTeacherSubject(id: number): Promise<void> {
    return apiDelete(`/teacher-subjects/${id}`);
  }

  async toggleTeacherSubjectStatus(id: number): Promise<TeacherSubject> {
    const response = await apiPatch<any>(`/teacher-subjects/${id}/toggle-status`, {});
    return mapToTeacherSubject(response);
  }

  // Método legado para compatibilidade
  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<PaginatedTeacherSubjectResponse> {
    return this.getTeacherSubjects({ page, limit });
  }
}

export const teacherSubjectService = new TeacherSubjectService();