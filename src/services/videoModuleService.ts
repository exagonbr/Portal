import {
  VideoModuleDto,
  CreateVideoModuleDto,
  UpdateVideoModuleDto,
  VideoModuleFilter,
} from '@/types/videoModule';
import {
  PaginatedResponse,
  VideoModuleResponseDto as ApiVideoModuleResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToVideoModuleDto = (data: ApiVideoModuleResponseDto): VideoModuleDto => ({
  id: data.id,
  collection_id: data.collection_id,
  module_number: data.module_number,
  title: data.title,
  synopsis: data.synopsis,
  release_year: data.release_year,
  duration: data.duration,
  education_cycle: data.education_cycle,
  poster_image_url: data.poster_image_url,
  video_url: data.video_url,
  order_in_module: data.order_in_module,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getVideoModules = async (params: VideoModuleFilter): Promise<PaginatedResponse<VideoModuleDto>> => {
  try {
    const response = await apiGet<any>('/video-modules', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de video modules:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiVideoModuleResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para video modules:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToVideoModuleDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar video modules:', error);
    
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

export const getVideoModuleById = async (id: string): Promise<VideoModuleDto> => {
  const response = await apiGet<ApiVideoModuleResponseDto>(`/video-modules/${id}`);
  return mapToVideoModuleDto(response);
};

export const createVideoModule = async (data: CreateVideoModuleDto): Promise<VideoModuleDto> => {
  const response = await apiPost<ApiVideoModuleResponseDto>('/video-modules', data);
  return mapToVideoModuleDto(response);
};

export const updateVideoModule = async (id: string, data: UpdateVideoModuleDto): Promise<VideoModuleDto> => {
  const response = await apiPut<ApiVideoModuleResponseDto>(`/video-modules/${id}`, data);
  return mapToVideoModuleDto(response);
};

export const deleteVideoModule = async (id: string): Promise<void> => {
  return apiDelete(`/video-modules/${id}`);
};

export const videoModuleService = {
  getVideoModules,
  getVideoModuleById,
  createVideoModule,
  updateVideoModule,
  deleteVideoModule,
};