import {
  TagDto,
  CreateTagDto,
  UpdateTagDto,
  TagFilter,
} from '@/types/tag';
import {
  PaginatedResponse,
  TagResponseDto as ApiTagResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToTagDto = (data: ApiTagResponseDto): TagDto => ({
  id: String(data.id),
  name: data.name || '',
  deleted: data.deleted,
  created_at: data.date_created,
  updated_at: data.last_updated,
});

export const getTags = async (params: TagFilter): Promise<PaginatedResponse<TagDto>> => {
  const response = await apiGet<PaginatedResponse<ApiTagResponseDto>>('/tags', params);
  return {
    ...response,
    items: response.items.map(mapToTagDto),
  };
};

export const getTagById = async (id: number): Promise<TagDto> => {
  const response = await apiGet<ApiTagResponseDto>(`/tags/${id}`);
  return mapToTagDto(response);
};

export const createTag = async (data: CreateTagDto): Promise<TagDto> => {
  const response = await apiPost<ApiTagResponseDto>('/tags', data);
  return mapToTagDto(response);
};

export const updateTag = async (id: number, data: UpdateTagDto): Promise<TagDto> => {
  const response = await apiPut<ApiTagResponseDto>(`/tags/${id}`, data);
  return mapToTagDto(response);
};

export const deleteTag = async (id: number): Promise<void> => {
  return apiDelete(`/tags/${id}`);
};

export const tagService = {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};