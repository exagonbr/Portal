import {
  PublisherDto,
  CreatePublisherDto,
  UpdatePublisherDto,
  PublisherFilter,
} from '@/types/publisher';
import {
  PaginatedResponse,
  PublisherResponseDto as ApiPublisherResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToPublisherDto = (data: ApiPublisherResponseDto): PublisherDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  is_active: data.is_active,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getPublishers = async (params: PublisherFilter): Promise<PaginatedResponse<PublisherDto>> => {
  const response = await apiGet<PaginatedResponse<ApiPublisherResponseDto>>('/publishers', params);
  return {
    ...response,
    items: response.items.map(mapToPublisherDto),
  };
};

export const getPublisherById = async (id: number): Promise<PublisherDto> => {
  const response = await apiGet<ApiPublisherResponseDto>(`/publishers/${id}`);
  return mapToPublisherDto(response);
};

export const createPublisher = async (data: CreatePublisherDto): Promise<PublisherDto> => {
  const response = await apiPost<ApiPublisherResponseDto>('/publishers', data);
  return mapToPublisherDto(response);
};

export const updatePublisher = async (id: number, data: UpdatePublisherDto): Promise<PublisherDto> => {
  const response = await apiPut<ApiPublisherResponseDto>(`/publishers/${id}`, data);
  return mapToPublisherDto(response);
};

export const deletePublisher = async (id: number): Promise<void> => {
  return apiDelete(`/publishers/${id}`);
};

export const togglePublisherStatus = async (id: number): Promise<PublisherDto> => {
    const publisher = await getPublisherById(id);
    const response = await apiPatch<ApiPublisherResponseDto>(`/publishers/${id}/status`, { active: !publisher.is_active });
    return mapToPublisherDto(response);
};

export const publisherService = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  togglePublisherStatus,
};