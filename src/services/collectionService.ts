import {
  CollectionDto,
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionFilter,
} from '@/types/collection';
import {
  PaginatedResponse,
  CollectionResponseDto as ApiCollectionResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToCollectionDto = (data: ApiCollectionResponseDto): CollectionDto => ({
  id: data.id,
  name: data.name,
  synopsis: data.synopsis,
  cover_image: data.cover_image,
  support_material: data.support_material,
  total_duration: data.total_duration,
  subject: data.subject,
  tags: data.tags,
  created_by: data.created_by,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getCollections = async (params: CollectionFilter): Promise<PaginatedResponse<CollectionDto>> => {
  const response = await apiGet<PaginatedResponse<ApiCollectionResponseDto>>('/collections', params);
  return {
    ...response,
    items: response.items.map(mapToCollectionDto),
  };
};

export const getCollectionById = async (id: string): Promise<CollectionDto> => {
  const response = await apiGet<ApiCollectionResponseDto>(`/collections/${id}`);
  return mapToCollectionDto(response);
};

export const createCollection = async (data: CreateCollectionDto): Promise<CollectionDto> => {
  const response = await apiPost<ApiCollectionResponseDto>('/collections', data);
  return mapToCollectionDto(response);
};

export const updateCollection = async (id: string, data: UpdateCollectionDto): Promise<CollectionDto> => {
  const response = await apiPut<ApiCollectionResponseDto>(`/collections/${id}`, data);
  return mapToCollectionDto(response);
};

export const deleteCollection = async (id: string): Promise<void> => {
  return apiDelete(`/collections/${id}`);
};

export const collectionService = {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
};