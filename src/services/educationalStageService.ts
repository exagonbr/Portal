import {
  EducationalStageDto,
  CreateEducationalStageDto,
  UpdateEducationalStageDto,
  EducationalStageFilter,
} from '@/types/educationalStage';
import {
  PaginatedResponse,
  EducationalStageResponseDto as ApiEducationalStageResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToEducationalStageDto = (data: ApiEducationalStageResponseDto): EducationalStageDto => ({
  id: String(data.id),
  name: data.name,
  deleted: data.deleted,
  grade_1: data.grade_1,
  grade_2: data.grade_2,
  grade_3: data.grade_3,
  grade_4: data.grade_4,
  grade_5: data.grade_5,
  grade_6: data.grade_6,
  grade_7: data.grade_7,
  grade_8: data.grade_8,
  grade_9: data.grade_9,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
});

export const getEducationalStages = async (params: EducationalStageFilter): Promise<PaginatedResponse<EducationalStageDto>> => {
  const response = await apiGet<PaginatedResponse<ApiEducationalStageResponseDto>>('/educational-stages', params);
  return {
    ...response,
    items: response.items.map(mapToEducationalStageDto),
  };
};

export const getEducationalStageById = async (id: number): Promise<EducationalStageDto> => {
  const response = await apiGet<ApiEducationalStageResponseDto>(`/educational-stages/${id}`);
  return mapToEducationalStageDto(response);
};

export const createEducationalStage = async (data: CreateEducationalStageDto): Promise<EducationalStageDto> => {
  const response = await apiPost<ApiEducationalStageResponseDto>('/educational-stages', data);
  return mapToEducationalStageDto(response);
};

export const updateEducationalStage = async (id: number, data: UpdateEducationalStageDto): Promise<EducationalStageDto> => {
  const response = await apiPut<ApiEducationalStageResponseDto>(`/educational-stages/${id}`, data);
  return mapToEducationalStageDto(response);
};

export const deleteEducationalStage = async (id: number): Promise<void> => {
  return apiDelete(`/educational-stages/${id}`);
};

export const educationalStageService = {
  getEducationalStages,
  getEducationalStageById,
  createEducationalStage,
  updateEducationalStage,
  deleteEducationalStage,
};