import {
  VideoCollectionDto,
  CreateVideoCollectionDto,
  UpdateVideoCollectionDto,
  VideoCollectionFilter,
} from '@/types/videoCollection';
import {
  PaginatedResponse,
  VideoCollectionResponseDto as ApiVideoCollectionResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToVideoCollectionDto = (data: ApiVideoCollectionResponseDto): VideoCollectionDto => ({
  id: data.id,
  name: data.name,
  synopsis: data.synopsis,
  producer: data.producer,
  release_date: data.release_date,
  contract_expiry_date: data.contract_expiry_date,
  authors: data.authors,
  target_audience: data.target_audience,
  total_hours: data.total_hours,
  poster_image_url: data.poster_image_url,
  carousel_image_url: data.carousel_image_url,
  ebook_file_url: data.ebook_file_url,
  use_default_cover_for_videos: data.use_default_cover_for_videos,
  deleted: data.deleted,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getVideoCollections = async (params: VideoCollectionFilter): Promise<PaginatedResponse<VideoCollectionDto>> => {
  try {
    const response = await apiGet<any>('/video-collections', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de video collections:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiVideoCollectionResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para video collections:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToVideoCollectionDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar video collections:', error);
    
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

export const getVideoCollectionById = async (id: string): Promise<VideoCollectionDto> => {
  const response = await apiGet<ApiVideoCollectionResponseDto>(`/video-collections/${id}`);
  return mapToVideoCollectionDto(response);
};

export const createVideoCollection = async (data: CreateVideoCollectionDto): Promise<VideoCollectionDto> => {
  const response = await apiPost<ApiVideoCollectionResponseDto>('/video-collections', data);
  return mapToVideoCollectionDto(response);
};

export const updateVideoCollection = async (id: string, data: UpdateVideoCollectionDto): Promise<VideoCollectionDto> => {
  const response = await apiPut<ApiVideoCollectionResponseDto>(`/video-collections/${id}`, data);
  return mapToVideoCollectionDto(response);
};

export const deleteVideoCollection = async (id: string): Promise<void> => {
  return apiDelete(`/video-collections/${id}`);
};

export const videoCollectionService = {
  getVideoCollections,
  getVideoCollectionById,
  createVideoCollection,
  updateVideoCollection,
  deleteVideoCollection,
};