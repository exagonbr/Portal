import {
  GenreDto,
  CreateGenreDto,
  UpdateGenreDto,
  GenreFilter,
} from '@/types/genre';
import {
  PaginatedResponse,
  GenreResponseDto as ApiGenreResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToGenreDto = (data: ApiGenreResponseDto): GenreDto => ({
  id: String(data.id),
  name: data.name,
  api_id: data.api_id,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getGenres = async (params: GenreFilter): Promise<PaginatedResponse<GenreDto>> => {
  const response = await apiGet<PaginatedResponse<ApiGenreResponseDto>>('/genres', params);
  return {
    ...response,
    items: response.items.map(mapToGenreDto),
  };
};

export const getGenreById = async (id: number): Promise<GenreDto> => {
  const response = await apiGet<ApiGenreResponseDto>(`/genres/${id}`);
  return mapToGenreDto(response);
};

export const createGenre = async (data: CreateGenreDto): Promise<GenreDto> => {
  const response = await apiPost<ApiGenreResponseDto>('/genres', data);
  return mapToGenreDto(response);
};

export const updateGenre = async (id: number, data: UpdateGenreDto): Promise<GenreDto> => {
  const response = await apiPut<ApiGenreResponseDto>(`/genres/${id}`, data);
  return mapToGenreDto(response);
};

export const deleteGenre = async (id: number): Promise<void> => {
  return apiDelete(`/genres/${id}`);
};

export const genreService = {
  getGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
};