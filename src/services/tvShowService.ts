import {
  TvShowDto,
  CreateTvShowDto,
  UpdateTvShowDto,
  TvShowFilter,
} from '@/types/tvShow';
import {
  PaginatedResponse,
  TvShowResponseDto as ApiTvShowResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToTvShowDto = (data: ApiTvShowResponseDto): TvShowDto => ({
  id: String(data.id),
  name: data.name,
  overview: data.overview,
  producer: data.producer,
  poster_path: data.poster_path,
  backdrop_path: data.backdrop_path,
  first_air_date: data.first_air_date,
  contract_term_end: data.contract_term_end,
  is_active: !data.deleted,
  created_at: data.date_created,
  updated_at: data.last_updated,
});

export const getTvShows = async (params: TvShowFilter): Promise<PaginatedResponse<TvShowDto>> => {
  const response = await apiGet<PaginatedResponse<ApiTvShowResponseDto>>('/tv-shows', params);
  return {
    ...response,
    items: response.items.map(mapToTvShowDto),
  };
};

export const getTvShowById = async (id: number): Promise<TvShowDto> => {
  const response = await apiGet<ApiTvShowResponseDto>(`/tv-shows/${id}`);
  return mapToTvShowDto(response);
};

export const createTvShow = async (data: CreateTvShowDto): Promise<TvShowDto> => {
  const response = await apiPost<ApiTvShowResponseDto>('/tv-shows', data);
  return mapToTvShowDto(response);
};

export const updateTvShow = async (id: number, data: UpdateTvShowDto): Promise<TvShowDto> => {
  const response = await apiPut<ApiTvShowResponseDto>(`/tv-shows/${id}`, data);
  return mapToTvShowDto(response);
};

export const deleteTvShow = async (id: number): Promise<void> => {
  return apiDelete(`/tv-shows/${id}`);
};

export const toggleTvShowStatus = async (id: number): Promise<TvShowDto> => {
    const tvShow = await getTvShowById(id);
    const response = await apiPatch<ApiTvShowResponseDto>(`/tv-shows/${id}/status`, { active: !tvShow.is_active });
    return mapToTvShowDto(response);
};

export const tvShowService = {
  getTvShows,
  getTvShowById,
  createTvShow,
  updateTvShow,
  deleteTvShow,
  toggleTvShowStatus,
};