import {
  EducationCycleDto,
  CreateEducationCycleDto,
  UpdateEducationCycleDto,
  EducationCycleFilter,
  EducationLevel,
} from '@/types/educationCycle';
import {
  PaginatedResponse,
  EducationCycleResponseDto as ApiEducationCycleResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToEducationCycleDto = (data: ApiEducationCycleResponseDto): EducationCycleDto => ({
  id: data.id,
  name: data.name,
  level: data.level as EducationLevel,
  description: data.description,
  duration_years: data.duration_years,
  min_age: data.min_age,
  max_age: data.max_age,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getEducationCycles = async (params: EducationCycleFilter): Promise<PaginatedResponse<EducationCycleDto>> => {
  const response = await apiGet<PaginatedResponse<ApiEducationCycleResponseDto>>('/education-cycles', params);
  return {
    ...response,
    items: response.items.map(mapToEducationCycleDto),
  };
};

export const getEducationCycleById = async (id: string): Promise<EducationCycleDto> => {
  const response = await apiGet<ApiEducationCycleResponseDto>(`/education-cycles/${id}`);
  return mapToEducationCycleDto(response);
};

export const createEducationCycle = async (data: CreateEducationCycleDto): Promise<EducationCycleDto> => {
  const response = await apiPost<ApiEducationCycleResponseDto>('/education-cycles', data);
  return mapToEducationCycleDto(response);
};

export const updateEducationCycle = async (id: string, data: UpdateEducationCycleDto): Promise<EducationCycleDto> => {
  const response = await apiPut<ApiEducationCycleResponseDto>(`/education-cycles/${id}`, data);
  return mapToEducationCycleDto(response);
};

export const deleteEducationCycle = async (id: string): Promise<void> => {
  return apiDelete(`/education-cycles/${id}`);
};

export const educationCycleService = {
  getEducationCycles,
  getEducationCycleById,
  createEducationCycle,
  updateEducationCycle,
  deleteEducationCycle,
};