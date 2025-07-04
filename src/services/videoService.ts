import {
  VideoDto,
  CreateVideoDto,
  UpdateVideoDto,
  VideoFilter,
} from '@/types/video';
import {
  PaginatedResponse,
  VideoResponseDto as ApiVideoResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToVideoDto = (data: ApiVideoResponseDto): VideoDto => ({
  id: String(data.id),
  title: data.title,
  overview: data.overview,
  release_date: data.release_date,
  duration: data.duration,
  show_id: data.show_id || undefined,
  season_number: data.season_number,
  episode_number: data.episode_number,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
});

export const getVideos = async (params: VideoFilter): Promise<PaginatedResponse<VideoDto>> => {
  const response = await apiGet<PaginatedResponse<ApiVideoResponseDto>>('/videos', params);
  return {
    ...response,
    items: response.items.map(mapToVideoDto),
  };
};

export const getVideoById = async (id: number): Promise<VideoDto> => {
  const response = await apiGet<ApiVideoResponseDto>(`/videos/${id}`);
  return mapToVideoDto(response);
};

export const createVideo = async (data: CreateVideoDto): Promise<VideoDto> => {
  const response = await apiPost<ApiVideoResponseDto>('/videos', data);
  return mapToVideoDto(response);
};

export const updateVideo = async (id: number, data: UpdateVideoDto): Promise<VideoDto> => {
  const response = await apiPut<ApiVideoResponseDto>(`/videos/${id}`, data);
  return mapToVideoDto(response);
};

export const deleteVideo = async (id: number): Promise<void> => {
  return apiDelete(`/videos/${id}`);
};

export const videoService = {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
};