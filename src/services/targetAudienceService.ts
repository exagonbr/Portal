import {
  TargetAudienceDto,
  CreateTargetAudienceDto,
  UpdateTargetAudienceDto,
  TargetAudienceFilter,
} from '@/types/targetAudience';
import {
  PaginatedResponse,
  TargetAudienceResponseDto as ApiTargetAudienceResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToTargetAudienceDto = (data: ApiTargetAudienceResponseDto): TargetAudienceDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  is_active: data.is_active || false,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getTargetAudiences = async (params: TargetAudienceFilter): Promise<PaginatedResponse<TargetAudienceDto>> => {
  const response = await apiGet<PaginatedResponse<ApiTargetAudienceResponseDto>>('/target-audiences', params);
  return {
    ...response,
    items: response.items.map(mapToTargetAudienceDto),
  };
};

export const getTargetAudienceById = async (id: number): Promise<TargetAudienceDto> => {
  const response = await apiGet<ApiTargetAudienceResponseDto>(`/target-audiences/${id}`);
  return mapToTargetAudienceDto(response);
};

export const createTargetAudience = async (data: CreateTargetAudienceDto): Promise<TargetAudienceDto> => {
  const response = await apiPost<ApiTargetAudienceResponseDto>('/target-audiences', data);
  return mapToTargetAudienceDto(response);
};

export const updateTargetAudience = async (id: number, data: UpdateTargetAudienceDto): Promise<TargetAudienceDto> => {
  const response = await apiPut<ApiTargetAudienceResponseDto>(`/target-audiences/${id}`, data);
  return mapToTargetAudienceDto(response);
};

export const deleteTargetAudience = async (id: number): Promise<void> => {
  return apiDelete(`/target-audiences/${id}`);
};

export const toggleTargetAudienceStatus = async (id: number): Promise<TargetAudienceDto> => {
    const audience = await getTargetAudienceById(id);
    const response = await apiPatch<ApiTargetAudienceResponseDto>(`/target-audiences/${id}/status`, { active: !audience.is_active });
    return mapToTargetAudienceDto(response);
};

export const targetAudienceService = {
  getTargetAudiences,
  getTargetAudienceById,
  createTargetAudience,
  updateTargetAudience,
  deleteTargetAudience,
  toggleTargetAudienceStatus,
};