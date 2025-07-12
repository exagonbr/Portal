import {
  ModuleDto,
  CreateModuleDto,
  UpdateModuleDto,
  ModuleFilter,
} from '@/types/module';
import {
  PaginatedResponse,
  ModuleResponseDto as ApiModuleResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToModuleDto = (data: ApiModuleResponseDto): ModuleDto => ({
  id: data.id,
  name: data.name,
  description: data.description,
  cover_image: data.cover_image,
  order: data.order,
  collection_id: data.collection_id,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getModules = async (params: ModuleFilter): Promise<PaginatedResponse<ModuleDto>> => {
  try {
    const response = await apiGet<any>('/modules', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de modules:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiModuleResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para modules:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToModuleDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar modules:', error);
    
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

export const getModuleById = async (id: string): Promise<ModuleDto> => {
  const response = await apiGet<ApiModuleResponseDto>(`/modules/${id}`);
  return mapToModuleDto(response);
};

export const createModule = async (data: CreateModuleDto): Promise<ModuleDto> => {
  const response = await apiPost<ApiModuleResponseDto>('/modules', data);
  return mapToModuleDto(response);
};

export const updateModule = async (id: string, data: UpdateModuleDto): Promise<ModuleDto> => {
  const response = await apiPut<ApiModuleResponseDto>(`/modules/${id}`, data);
  return mapToModuleDto(response);
};

export const deleteModule = async (id: string): Promise<void> => {
  return apiDelete(`/modules/${id}`);
};

export const moduleService = {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
};