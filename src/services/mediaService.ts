import {
  MediaEntryDto,
  CreateMediaEntryDto,
  UpdateMediaEntryDto,
  MediaEntryFilter,
} from '@/types/media';
import {
  PaginatedResponse,
  MediaEntryResponseDto as ApiMediaEntryResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToMediaEntryDto = (data: ApiMediaEntryResponseDto): MediaEntryDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  type: data.type,
  url: data.url,
  thumbnail: data.thumbnail,
  author_id: data.author_id ? String(data.author_id) : undefined,
  publisher_id: data.publisher_id ? String(data.publisher_id) : undefined,
  genre_id: data.genre_id ? String(data.genre_id) : undefined,
  subject_id: data.subject_id ? String(data.subject_id) : undefined,
  is_active: data.is_active,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
});

export const getMediaEntries = async (params: MediaEntryFilter): Promise<PaginatedResponse<MediaEntryDto>> => {
  const response = await apiGet<PaginatedResponse<ApiMediaEntryResponseDto>>('/media-entries', params);
  return {
    ...response,
    items: response.items.map(mapToMediaEntryDto),
  };
};

export const getMediaEntryById = async (id: number): Promise<MediaEntryDto> => {
  const response = await apiGet<ApiMediaEntryResponseDto>(`/media-entries/${id}`);
  return mapToMediaEntryDto(response);
};

export const createMediaEntry = async (data: CreateMediaEntryDto): Promise<MediaEntryDto> => {
  const response = await apiPost<ApiMediaEntryResponseDto>('/media-entries', data);
  return mapToMediaEntryDto(response);
};

export const updateMediaEntry = async (id: number, data: UpdateMediaEntryDto): Promise<MediaEntryDto> => {
  const response = await apiPut<ApiMediaEntryResponseDto>(`/media-entries/${id}`, data);
  return mapToMediaEntryDto(response);
};

export const deleteMediaEntry = async (id: number): Promise<void> => {
  return apiDelete(`/media-entries/${id}`);
};

export const toggleMediaEntryStatus = async (id: number): Promise<MediaEntryDto> => {
    const entry = await getMediaEntryById(id);
    const response = await apiPatch<ApiMediaEntryResponseDto>(`/media-entries/${id}/status`, { active: !entry.is_active });
    return mapToMediaEntryDto(response);
};

export const mediaService = {
  getMediaEntries,
  getMediaEntryById,
  createMediaEntry,
  updateMediaEntry,
  deleteMediaEntry,
  toggleMediaEntryStatus,
};