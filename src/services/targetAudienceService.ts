import {
  TargetAudienceDto,
  CreateTargetAudienceDto,
  UpdateTargetAudienceDto,
  TargetAudienceFilter,
} from '@/types/targetAudience';
import {
  PaginatedResponse,
  TargetAudienceResponseDto as ApiTargetAudienceResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToTargetAudienceDto = (data: ApiTargetAudienceResponseDto): TargetAudienceDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  is_active: data.is_active || false,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getTargetAudiences = async (params: TargetAudienceFilter): Promise<PaginatedResponse<TargetAudienceDto>> => {
  try {
    const response = await apiGet<any>('/target-audiences', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de target audiences:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiTargetAudienceResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para target audiences:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToTargetAudienceDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar target audiences:', error);
    
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

export const getTargetAudienceById = async (id: number): Promise<TargetAudienceDto> => {
  const response = await apiGet<ApiTargetAudienceResponseDto>(`/target-audiences/${id}`);
  return mapToTargetAudienceDto(response);
};

export const createTargetAudience = async (data: CreateTargetAudienceDto): Promise<TargetAudienceDto> => {
  const response = await apiPost<ApiTargetAudienceResponseDto>('/target-audiences', data);
  return mapToTargetAudienceDto(response);
};

export const updateTargetAudience = async (id: number, data: UpdateTargetAudienceDto): Promise<TargetAudienceDto> => {
  const response = await apiPut<ApiTargetAudienceResponseDto>(`/target-audiences/${id}`, data);
  return mapToTargetAudienceDto(response);
};

export const deleteTargetAudience = async (id: number): Promise<void> => {
  return apiDelete(`/target-audiences/${id}`);
};

export const toggleTargetAudienceStatus = async (id: number): Promise<TargetAudienceDto> => {
    const audience = await getTargetAudienceById(id);
    const response = await apiPatch<ApiTargetAudienceResponseDto>(`/target-audiences/${id}/status`, { active: !audience.is_active });
    return mapToTargetAudienceDto(response);
};

export const targetAudienceService = {
  getTargetAudiences,
  getTargetAudienceById,
  createTargetAudience,
  updateTargetAudience,
  deleteTargetAudience,
  toggleTargetAudienceStatus,
};