import {
  EducationPeriodDto,
  CreateEducationPeriodDto,
  UpdateEducationPeriodDto,
  EducationPeriodFilter,
} from '@/types/educationPeriod';
import {
  PaginatedResponse,
  EducationPeriodResponseDto as ApiEducationPeriodResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToEducationPeriodDto = (data: ApiEducationPeriodResponseDto): EducationPeriodDto => ({
  id: String(data.id),
  description: data.description,
  is_active: data.is_active || false,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getEducationPeriods = async (params: EducationPeriodFilter): Promise<PaginatedResponse<EducationPeriodDto>> => {
  try {
    const response = await apiGet<any>('/education-periods', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de education periods:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiEducationPeriodResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para education periods:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToEducationPeriodDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar education periods:', error);
    
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

export const getEducationPeriodById = async (id: number): Promise<EducationPeriodDto> => {
  const response = await apiGet<ApiEducationPeriodResponseDto>(`/education-periods/${id}`);
  return mapToEducationPeriodDto(response);
};

export const createEducationPeriod = async (data: CreateEducationPeriodDto): Promise<EducationPeriodDto> => {
  const response = await apiPost<ApiEducationPeriodResponseDto>('/education-periods', data);
  return mapToEducationPeriodDto(response);
};

export const updateEducationPeriod = async (id: number, data: UpdateEducationPeriodDto): Promise<EducationPeriodDto> => {
  const response = await apiPut<ApiEducationPeriodResponseDto>(`/education-periods/${id}`, data);
  return mapToEducationPeriodDto(response);
};

export const deleteEducationPeriod = async (id: number): Promise<void> => {
  return apiDelete(`/education-periods/${id}`);
};

export const toggleEducationPeriodStatus = async (id: number): Promise<EducationPeriodDto> => {
    const period = await getEducationPeriodById(id);
    const response = await apiPatch<ApiEducationPeriodResponseDto>(`/education-periods/${id}/status`, { active: !period.is_active });
    return mapToEducationPeriodDto(response);
};

export const educationPeriodService = {
  getEducationPeriods,
  getEducationPeriodById,
  createEducationPeriod,
  updateEducationPeriod,
  deleteEducationPeriod,
  toggleEducationPeriodStatus,
};