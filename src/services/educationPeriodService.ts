import {
  EducationPeriodDto,
  CreateEducationPeriodDto,
  UpdateEducationPeriodDto,
  EducationPeriodFilter,
} from '@/types/educationPeriod';
import {
  PaginatedResponse,
  EducationPeriodResponseDto as ApiEducationPeriodResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToEducationPeriodDto = (data: ApiEducationPeriodResponseDto): EducationPeriodDto => ({
  id: String(data.id),
  description: data.description,
  is_active: data.is_active || false,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getEducationPeriods = async (params: EducationPeriodFilter): Promise<PaginatedResponse<EducationPeriodDto>> => {
  const response = await apiGet<PaginatedResponse<ApiEducationPeriodResponseDto>>('/education-periods', params);
  return {
    ...response,
    items: response.items.map(mapToEducationPeriodDto),
  };
};

export const getEducationPeriodById = async (id: number): Promise<EducationPeriodDto> => {
  const response = await apiGet<ApiEducationPeriodResponseDto>(`/education-periods/${id}`);
  return mapToEducationPeriodDto(response);
};

export const createEducationPeriod = async (data: CreateEducationPeriodDto): Promise<EducationPeriodDto> => {
  const response = await apiPost<ApiEducationPeriodResponseDto>('/education-periods', data);
  return mapToEducationPeriodDto(response);
};

export const updateEducationPeriod = async (id: number, data: UpdateEducationPeriodDto): Promise<EducationPeriodDto> => {
  const response = await apiPut<ApiEducationPeriodResponseDto>(`/education-periods/${id}`, data);
  return mapToEducationPeriodDto(response);
};

export const deleteEducationPeriod = async (id: number): Promise<void> => {
  return apiDelete(`/education-periods/${id}`);
};

export const toggleEducationPeriodStatus = async (id: number): Promise<EducationPeriodDto> => {
    const period = await getEducationPeriodById(id);
    const response = await apiPatch<ApiEducationPeriodResponseDto>(`/education-periods/${id}/status`, { active: !period.is_active });
    return mapToEducationPeriodDto(response);
};

export const educationPeriodService = {
  getEducationPeriods,
  getEducationPeriodById,
  createEducationPeriod,
  updateEducationPeriod,
  deleteEducationPeriod,
  toggleEducationPeriodStatus,
};