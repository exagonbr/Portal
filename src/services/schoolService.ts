import { apiClient } from './apiClient';
import {
  School,
  CreateSchoolData,
  UpdateSchoolData,
  SchoolStats,
  SchoolFilter
} from '@/types/school';
import { PaginatedResponseDto } from '@/types/api';

export const schoolService = {
  // Listar escolas com paginação
  async list(filter?: SchoolFilter): Promise<PaginatedResponseDto<School>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponseDto<School>>(`/schools?${params.toString()}`);
    if (!response.data) {
      throw new Error('Failed to fetch schools: response data is undefined');
    }
    if (!response.data) {
      throw new Error('Failed to activate school: response data is undefined');
    }
    return response.data;
  },

  // Buscar escola por ID
  async getById(id: string): Promise<School> {
    const response = await apiClient.get<School>(`/schools/${id}`);
    if (!response.data) {
      throw new Error('Failed to fetch school: response data is undefined');
    }
    return response.data;
  },

  // Buscar escolas por instituição
  async getByInstitution(institutionId: string): Promise<School[]> {
    const response = await apiClient.get<School[]>(`/schools/institution/${institutionId}`);
    if (!response.data) {
      throw new Error('Failed to fetch schools by institution: response data is undefined');
    }
    return response.data;
  },

  // Criar nova escola
  async create(data: CreateSchoolData): Promise<School> {
    const response = await apiClient.post<School>('/schools', data);
    if (!response.data) {
      throw new Error('Failed to create school: response data is undefined');
    }
    return response.data;
  },

  // Atualizar escola
  async update(id: string, data: UpdateSchoolData): Promise<School> {
    const response = await apiClient.put<School>(`/schools/${id}`, data);
    if (!response.data) {
      throw new Error('Failed to update school: response data is undefined');
    }
    return response.data;
  },

  // Desativar escola
  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/schools/${id}`);
  },

  // Ativar escola
  async activate(id: string): Promise<School> {
    const response = await apiClient.post<School>(`/schools/${id}/activate`);
    if (!response.data) {
      throw new Error('Failed to activate school: response data is undefined');
    }
    return response.data;
  },

  // Obter estatísticas da escola
  async getStats(id: string): Promise<SchoolStats> {
    const response = await apiClient.get<SchoolStats>(`/schools/${id}/stats`);
    if (!response.data) {
      throw new Error('Failed to fetch school stats: response data is undefined');
    }
    return response.data;
  },

  // Verificar disponibilidade de código
  async checkCodeAvailability(code: string, excludeId?: string): Promise<boolean> {
    const params = new URLSearchParams({ code });
    if (excludeId) {
      params.append('excludeId', excludeId);
    }
    
    const response = await apiClient.get<{ available: boolean }>(`/schools/check-code?${params.toString()}`);
    if (!response.data) {
      throw new Error('Failed to check code availability: response data is undefined');
    }
    return response.data.available;
  }
};