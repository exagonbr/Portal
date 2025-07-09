import {
  PublisherDto,
  CreatePublisherDto,
  UpdatePublisherDto,
  PublisherFilter,
} from '@/types/publisher';
import {
  PaginatedResponse,
  PublisherResponseDto as ApiPublisherResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToPublisherDto = (data: ApiPublisherResponseDto): PublisherDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  is_active: data.is_active,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getPublishers = async (params: PublisherFilter): Promise<PaginatedResponse<PublisherDto>> => {
  try {
    const response = await apiGet<any>('/publishers', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de publishers:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiPublisherResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para publishers:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToPublisherDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar publishers:', error);
    
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

export const getPublisherById = async (id: number): Promise<PublisherDto> => {
  const response = await apiGet<ApiPublisherResponseDto>(`/publishers/${id}`);
  return mapToPublisherDto(response);
};

export const createPublisher = async (data: CreatePublisherDto): Promise<PublisherDto> => {
  const response = await apiPost<ApiPublisherResponseDto>('/publishers', data);
  return mapToPublisherDto(response);
};

export const updatePublisher = async (id: number, data: UpdatePublisherDto): Promise<PublisherDto> => {
  const response = await apiPut<ApiPublisherResponseDto>(`/publishers/${id}`, data);
  return mapToPublisherDto(response);
};

export const deletePublisher = async (id: number): Promise<void> => {
  return apiDelete(`/publishers/${id}`);
};

export const togglePublisherStatus = async (id: number): Promise<PublisherDto> => {
    const publisher = await getPublisherById(id);
    const response = await apiPatch<ApiPublisherResponseDto>(`/publishers/${id}/status`, { active: !publisher.is_active });
    return mapToPublisherDto(response);
};

export const publisherService = {
  getPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  togglePublisherStatus,
};