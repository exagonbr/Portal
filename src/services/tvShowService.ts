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

// Tipo para os dados mock que podem ter estrutura diferente
interface MockTvShowData {
  id: number;
  name: string;
  overview?: string;
  producer?: string;
  poster_path?: string;
  backdrop_path?: string;
  total_load?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  video_count?: number;
  created_at?: string;
  // Campos opcionais que podem estar presentes no TvShowResponseDto
  date_created?: string;
  last_updated?: string;
  first_air_date?: string;
  contract_term_end?: string;
  deleted?: boolean;
}

// Função para mapear dados mock ou da API para o DTO do frontend
const mapToTvShowDto = (data: MockTvShowData | ApiTvShowResponseDto): TvShowDto => {
  // Detectar se é dados mock ou dados da API
  const isMockData = 'video_count' in data || 'created_at' in data;
  
  if (isMockData) {
    const mockData = data as MockTvShowData;
    return {
      id: String(mockData.id),
      name: mockData.name,
      overview: mockData.overview || '',
      producer: mockData.producer || '',
      poster_path: mockData.poster_path,
      backdrop_path: mockData.backdrop_path,
      first_air_date: mockData.created_at || new Date().toISOString(),
      contract_term_end: mockData.created_at || new Date().toISOString(),
      is_active: true, // Dados mock são sempre ativos
      created_at: mockData.created_at || new Date().toISOString(),
      updated_at: mockData.created_at || new Date().toISOString(),
    };
  } else {
    // Dados da API
    const apiData = data as ApiTvShowResponseDto;
    return {
      id: String(apiData.id),
      name: apiData.name,
      overview: apiData.overview,
      producer: apiData.producer,
      poster_path: apiData.poster_path,
      backdrop_path: apiData.backdrop_path,
      first_air_date: apiData.first_air_date,
      contract_term_end: apiData.contract_term_end,
      is_active: !apiData.deleted,
      created_at: apiData.date_created,
      updated_at: apiData.last_updated,
    };
  }
};

// Interface para a resposta da API mock
interface TvShowMockApiResponse {
  success: boolean;
  data: {
    tvShows: MockTvShowData[];
    page: number;
    totalPages: number;
    total: number;
  };
  message?: string;
}

// Interface para a resposta real do backend
interface TvShowBackendApiResponse {
  success: boolean;
  data: {
    items: ApiTvShowResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export const getTvShows = async (params: TvShowFilter): Promise<PaginatedResponse<TvShowDto>> => {
  const response = await apiGet<TvShowMockApiResponse | TvShowBackendApiResponse>('/tv-shows', params);
  
  // Verificar se a resposta tem a estrutura esperada
  if (!response.data) {
    throw new Error('Resposta da API não contém dados');
  }
  
  // Detectar se é resposta mock ou real do backend
  if ('tvShows' in response.data) {
    // Resposta mock
    const mockResponse = response as TvShowMockApiResponse;
    return {
      items: mockResponse.data.tvShows.map(mapToTvShowDto),
      total: mockResponse.data.total,
      page: mockResponse.data.page,
      limit: Math.ceil(mockResponse.data.total / mockResponse.data.totalPages) || 10,
      totalPages: mockResponse.data.totalPages,
    };
  } else if ('items' in response.data) {
    // Resposta real do backend
    const backendResponse = response as TvShowBackendApiResponse;
    return {
      items: backendResponse.data.items.map(mapToTvShowDto),
      total: backendResponse.data.pagination.total,
      page: backendResponse.data.pagination.page,
      limit: backendResponse.data.pagination.limit,
      totalPages: backendResponse.data.pagination.totalPages,
    };
  } else {
    throw new Error('Estrutura de resposta da API não reconhecida');
  }
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