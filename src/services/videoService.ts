import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Interfaces para Video (tabela videos do backend)
export interface VideoDto {
  id: string
  api_id?: string
  title: string
  overview?: string
  popularity?: number
  class?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  vote_average?: number
  vote_count?: number
  season_number?: number
  episode_number?: number
  episode_count?: number
  air_date?: string
  name?: string
  first_air_date?: string
  last_air_date?: string
  number_of_episodes?: number
  number_of_seasons?: number
  status?: string
  type?: string
  in_production?: boolean
  original_language?: string
  original_name?: string
  origin_country?: string[]
  genres?: string[]
  production_companies?: string[]
  networks?: string[]
  created_by?: string[]
  seasons?: any[]
  episode_run_time?: number[]
  homepage?: string
  tagline?: string
  adult?: boolean
  video?: boolean
  belongs_to_collection?: any
  budget?: number
  imdb_id?: string
  original_title?: string
  production_countries?: string[]
  revenue?: number
  runtime?: number
  spoken_languages?: string[]
  date_created: string
  last_updated: string
  deleted: boolean
  version: number
}

export interface CreateVideoDto {
  api_id?: string
  title: string
  overview?: string
  popularity?: number
  class?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  vote_average?: number
  vote_count?: number
  season_number?: number
  episode_number?: number
  episode_count?: number
  air_date?: string
  name?: string
  first_air_date?: string
  last_air_date?: string
  number_of_episodes?: number
  number_of_seasons?: number
  status?: string
  type?: string
  in_production?: boolean
  original_language?: string
  original_name?: string
  origin_country?: string[]
  genres?: string[]
  production_companies?: string[]
  networks?: string[]
  created_by?: string[]
  seasons?: any[]
  episode_run_time?: number[]
  homepage?: string
  tagline?: string
  adult?: boolean
  video?: boolean
  belongs_to_collection?: any
  budget?: number
  imdb_id?: string
  original_title?: string
  production_countries?: string[]
  revenue?: number
  runtime?: number
  spoken_languages?: string[]
}

export interface UpdateVideoDto {
  api_id?: string
  title?: string
  overview?: string
  popularity?: number
  class?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  vote_average?: number
  vote_count?: number
  season_number?: number
  episode_number?: number
  episode_count?: number
  air_date?: string
  name?: string
  first_air_date?: string
  last_air_date?: string
  number_of_episodes?: number
  number_of_seasons?: number
  status?: string
  type?: string
  in_production?: boolean
  original_language?: string
  original_name?: string
  origin_country?: string[]
  genres?: string[]
  production_companies?: string[]
  networks?: string[]
  created_by?: string[]
  seasons?: any[]
  episode_run_time?: number[]
  homepage?: string
  tagline?: string
  adult?: boolean
  video?: boolean
  belongs_to_collection?: any
  budget?: number
  imdb_id?: string
  original_title?: string
  production_countries?: string[]
  revenue?: number
  runtime?: number
  spoken_languages?: string[]
}

export interface VideoFilter {
  page?: number
  limit?: number
  search?: string
  class?: string
  status?: string
  original_language?: string
  deleted?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Função para mapear a resposta da API para o DTO do frontend
const mapToVideoDto = (data: any): VideoDto => ({
  id: String(data.id),
  api_id: data.api_id,
  title: data.title || data.name || '',
  overview: data.overview,
  popularity: data.popularity ? Number(data.popularity) : undefined,
  class: data.class,
  poster_path: data.poster_path,
  backdrop_path: data.backdrop_path,
  release_date: data.release_date,
  vote_average: data.vote_average ? Number(data.vote_average) : undefined,
  vote_count: data.vote_count ? Number(data.vote_count) : undefined,
  season_number: data.season_number ? Number(data.season_number) : undefined,
  episode_number: data.episode_number ? Number(data.episode_number) : undefined,
  episode_count: data.episode_count ? Number(data.episode_count) : undefined,
  air_date: data.air_date,
  name: data.name,
  first_air_date: data.first_air_date,
  last_air_date: data.last_air_date,
  number_of_episodes: data.number_of_episodes ? Number(data.number_of_episodes) : undefined,
  number_of_seasons: data.number_of_seasons ? Number(data.number_of_seasons) : undefined,
  status: data.status,
  type: data.type,
  in_production: Boolean(data.in_production),
  original_language: data.original_language,
  original_name: data.original_name,
  origin_country: data.origin_country,
  genres: data.genres,
  production_companies: data.production_companies,
  networks: data.networks,
  created_by: data.created_by,
  seasons: data.seasons,
  episode_run_time: data.episode_run_time,
  homepage: data.homepage,
  tagline: data.tagline,
  adult: Boolean(data.adult),
  video: Boolean(data.video),
  belongs_to_collection: data.belongs_to_collection,
  budget: data.budget ? Number(data.budget) : undefined,
  imdb_id: data.imdb_id,
  original_title: data.original_title,
  production_countries: data.production_countries,
  revenue: data.revenue ? Number(data.revenue) : undefined,
  runtime: data.runtime ? Number(data.runtime) : undefined,
  spoken_languages: data.spoken_languages,
  date_created: data.date_created || new Date().toISOString(),
  last_updated: data.last_updated || new Date().toISOString(),
  deleted: Boolean(data.deleted),
  version: data.version || 1,
});

export const getVideos = async (params: VideoFilter): Promise<PaginatedResponse<VideoDto>> => {
  try {
    const response = await apiGet<any>('/videos', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de videos:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: any[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para videos:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToVideoDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar videos:', error);
    
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

export const getVideoById = async (id: string): Promise<VideoDto> => {
  const response = await apiGet<any>(`/videos/${id}`);
  return mapToVideoDto(response);
};

export const createVideo = async (data: CreateVideoDto): Promise<VideoDto> => {
  const response = await apiPost<any>('/videos', data);
  return mapToVideoDto(response);
};

export const updateVideo = async (id: string, data: UpdateVideoDto): Promise<VideoDto> => {
  const response = await apiPut<any>(`/videos/${id}`, data);
  return mapToVideoDto(response);
};

export const deleteVideo = async (id: string): Promise<void> => {
  return apiDelete(`/videos/${id}`);
};

export const softDeleteVideo = async (id: string): Promise<VideoDto> => {
  const response = await apiPatch<any>(`/videos/${id}/soft-delete`, {});
  return mapToVideoDto(response);
};

export const restoreVideo = async (id: string): Promise<VideoDto> => {
  const response = await apiPatch<any>(`/videos/${id}/restore`, {});
  return mapToVideoDto(response);
};

export const getVideosByShow = async (showId: string): Promise<VideoDto[]> => {
  const response = await apiGet<any[]>(`/videos/show/${showId}`);
  return response.map(mapToVideoDto);
};

export const getVideosBySeason = async (showId: string, seasonNumber: number): Promise<VideoDto[]> => {
  const response = await apiGet<any[]>(`/videos/show/${showId}/season/${seasonNumber}`);
  return response.map(mapToVideoDto);
};

export const getVideosByClass = async (videoClass: string): Promise<VideoDto[]> => {
  const response = await apiGet<any[]>(`/videos/class/${videoClass}`);
  return response.map(mapToVideoDto);
};

export const getVideosStats = async (): Promise<any> => {
  return await apiGet<any>('/videos/stats');
};

export const videoService = {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  softDeleteVideo,
  restoreVideo,
  getVideosByShow,
  getVideosBySeason,
  getVideosByClass,
  getVideosStats,
};