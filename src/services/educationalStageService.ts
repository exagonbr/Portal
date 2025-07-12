import {
  EducationalStageDto,
  CreateEducationalStageDto,
  UpdateEducationalStageDto,
  EducationalStageFilter,
} from '@/types/educationalStage';
import {
  PaginatedResponse,
  EducationalStageResponseDto as ApiEducationalStageResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToEducationalStageDto = (data: ApiEducationalStageResponseDto): EducationalStageDto => ({
  id: String(data.id),
  name: data.name,
  deleted: data.deleted,
  grade_1: data.grade_1,
  grade_2: data.grade_2,
  grade_3: data.grade_3,
  grade_4: data.grade_4,
  grade_5: data.grade_5,
  grade_6: data.grade_6,
  grade_7: data.grade_7,
  grade_8: data.grade_8,
  grade_9: data.grade_9,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
});

export const getEducationalStages = async (params: EducationalStageFilter): Promise<PaginatedResponse<EducationalStageDto>> => {
  try {
    const response = await apiGet<any>('/educational-stages', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de educational stages:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiEducationalStageResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para educational stages:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToEducationalStageDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar educational stages:', error);
    
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

export const getEducationalStageById = async (id: number): Promise<EducationalStageDto> => {
  const response = await apiGet<ApiEducationalStageResponseDto>(`/educational-stages/${id}`);
  return mapToEducationalStageDto(response);
};

export const createEducationalStage = async (data: CreateEducationalStageDto): Promise<EducationalStageDto> => {
  const response = await apiPost<ApiEducationalStageResponseDto>('/educational-stages', data);
  return mapToEducationalStageDto(response);
};

export const updateEducationalStage = async (id: number, data: UpdateEducationalStageDto): Promise<EducationalStageDto> => {
  const response = await apiPut<ApiEducationalStageResponseDto>(`/educational-stages/${id}`, data);
  return mapToEducationalStageDto(response);
};

export const deleteEducationalStage = async (id: number): Promise<void> => {
  return apiDelete(`/educational-stages/${id}`);
};

export const educationalStageService = {
  getEducationalStages,
  getEducationalStageById,
  createEducationalStage,
  updateEducationalStage,
  deleteEducationalStage,
};