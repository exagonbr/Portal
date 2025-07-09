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
  try {
    const response = await apiGet<any>('/media-entries', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de media entries:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiMediaEntryResponseDto[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || 10;
    let totalPages = 0;

    // Verificar se a resposta tem o formato padrão PaginatedResponse
    if (response && response.items && Array.isArray(response.items)) {
      items = response.items;
      total = response.total || 0;
      page = response.page || page;
      limit = response.limit || limit;
      totalPages = response.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta tem formato ApiResponse com data
    else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      total = response.data.total || 0;
      page = response.data.page || page;
      limit = response.data.limit || limit;
      totalPages = response.data.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta é diretamente um array
    else if (response && Array.isArray(response)) {
      items = response;
      total = response.length;
      totalPages = Math.ceil(total / limit);
    }
    // Se não conseguiu identificar o formato, usar valores padrão
    else {
      console.warn('⚠️ [API] Formato de resposta não reconhecido para media entries:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToMediaEntryDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar media entries:', error);
    
    // Retornar uma resposta vazia em caso de erro
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0,
    };
  }
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