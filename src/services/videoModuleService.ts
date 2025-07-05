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
  const response = await apiGet<PaginatedResponse<ApiVideoModuleResponseDto>>('/video-modules', params);
  return {
    ...response,
    items: response.items.map(mapToVideoModuleDto),
  };
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