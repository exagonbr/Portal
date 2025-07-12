import {
  PublicDto,
  CreatePublicDto,
  UpdatePublicDto,
  PublicFilter,
} from '@/types/public';
import {
  PaginatedResponse,
  PublicResponseDto as ApiPublicResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToPublicDto = (data: ApiPublicResponseDto): PublicDto => ({
  id: String(data.id),
  name: data.name,
  api_id: data.api_id,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getPublics = async (params: PublicFilter): Promise<PaginatedResponse<PublicDto>> => {
  try {
    const response = await apiGet<any>('/publics', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de publics:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiPublicResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para publics:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToPublicDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar publics:', error);
    
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

export const getPublicById = async (id: number): Promise<PublicDto> => {
  const response = await apiGet<ApiPublicResponseDto>(`/publics/${id}`);
  return mapToPublicDto(response);
};

export const createPublic = async (data: CreatePublicDto): Promise<PublicDto> => {
  const response = await apiPost<ApiPublicResponseDto>('/publics', data);
  return mapToPublicDto(response);
};

export const updatePublic = async (id: number, data: UpdatePublicDto): Promise<PublicDto> => {
  const response = await apiPut<ApiPublicResponseDto>(`/publics/${id}`, data);
  return mapToPublicDto(response);
};

export const deletePublic = async (id: number): Promise<void> => {
  return apiDelete(`/publics/${id}`);
};

export const publicService = {
  getPublics,
  getPublicById,
  createPublic,
  updatePublic,
  deletePublic,
};