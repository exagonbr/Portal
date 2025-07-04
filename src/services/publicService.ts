import {
  PublicDto,
  CreatePublicDto,
  UpdatePublicDto,
  PublicFilter,
} from '@/types/public';
import {
  PaginatedResponse,
  PublicResponseDto as ApiPublicResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToPublicDto = (data: ApiPublicResponseDto): PublicDto => ({
  id: String(data.id),
  name: data.name,
  api_id: data.api_id,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getPublics = async (params: PublicFilter): Promise<PaginatedResponse<PublicDto>> => {
  const response = await apiGet<PaginatedResponse<ApiPublicResponseDto>>('/publics', params);
  return {
    ...response,
    items: response.items.map(mapToPublicDto),
  };
};

export const getPublicById = async (id: number): Promise<PublicDto> => {
  const response = await apiGet<ApiPublicResponseDto>(`/publics/${id}`);
  return mapToPublicDto(response);
};

export const createPublic = async (data: CreatePublicDto): Promise<PublicDto> => {
  const response = await apiPost<ApiPublicResponseDto>('/publics', data);
  return mapToPublicDto(response);
};

export const updatePublic = async (id: number, data: UpdatePublicDto): Promise<PublicDto> => {
  const response = await apiPut<ApiPublicResponseDto>(`/publics/${id}`, data);
  return mapToPublicDto(response);
};

export const deletePublic = async (id: number): Promise<void> => {
  return apiDelete(`/publics/${id}`);
};

export const publicService = {
  getPublics,
  getPublicById,
  createPublic,
  updatePublic,
  deletePublic,
};