import {
  CollectionDto,
  CreateCollectionDto,
  UpdateCollectionDto,
  CollectionFilter,
} from '@/types/collection';
import {
  PaginatedResponse,
  CollectionResponseDto as ApiCollectionResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToCollectionDto = (data: ApiCollectionResponseDto): CollectionDto => ({
  id: data.id,
  name: data.name,
  synopsis: data.synopsis,
  cover_image: data.cover_image,
  support_material: data.support_material,
  total_duration: data.total_duration,
  subject: data.subject,
  tags: data.tags,
  created_by: data.created_by,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getCollections = async (params: CollectionFilter): Promise<PaginatedResponse<CollectionDto>> => {
  try {
    const response = await apiGet<any>('/collections', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de collections:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiCollectionResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para collections:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToCollectionDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar collections:', error);
    
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

export const getCollectionById = async (id: string): Promise<CollectionDto> => {
  const response = await apiGet<ApiCollectionResponseDto>(`/collections/${id}`);
  return mapToCollectionDto(response);
};

export const createCollection = async (data: CreateCollectionDto): Promise<CollectionDto> => {
  const response = await apiPost<ApiCollectionResponseDto>('/collections', data);
  return mapToCollectionDto(response);
};

export const updateCollection = async (id: string, data: UpdateCollectionDto): Promise<CollectionDto> => {
  const response = await apiPut<ApiCollectionResponseDto>(`/collections/${id}`, data);
  return mapToCollectionDto(response);
};

export const deleteCollection = async (id: string): Promise<void> => {
  return apiDelete(`/collections/${id}`);
};

export const collectionService = {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
};