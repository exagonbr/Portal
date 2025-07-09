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
  try {
    const response = await apiGet<any>('/genres', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de genres:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiGenreResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para genres:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToGenreDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar genres:', error);
    
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