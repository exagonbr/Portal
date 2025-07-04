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
  const response = await apiGet<PaginatedResponse<ApiVideoCollectionResponseDto>>('/video-collections', params);
  return {
    ...response,
    items: response.items.map(mapToVideoCollectionDto),
  };
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