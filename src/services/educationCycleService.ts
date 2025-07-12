import {
  EducationCycleDto,
  CreateEducationCycleDto,
  UpdateEducationCycleDto,
  EducationCycleFilter,
  EducationLevel,
} from '@/types/educationCycle';
import {
  PaginatedResponse,
  EducationCycleResponseDto as ApiEducationCycleResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToEducationCycleDto = (data: ApiEducationCycleResponseDto): EducationCycleDto => ({
  id: data.id,
  name: data.name,
  level: data.level as EducationLevel,
  description: data.description,
  duration_years: data.duration_years,
  min_age: data.min_age,
  max_age: data.max_age,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getEducationCycles = async (params: EducationCycleFilter): Promise<PaginatedResponse<EducationCycleDto>> => {
  try {
    const response = await apiGet<any>('/education-cycles', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de education cycles:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiEducationCycleResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para education cycles:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToEducationCycleDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar education cycles:', error);
    
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

export const getEducationCycleById = async (id: string): Promise<EducationCycleDto> => {
  const response = await apiGet<ApiEducationCycleResponseDto>(`/education-cycles/${id}`);
  return mapToEducationCycleDto(response);
};

export const createEducationCycle = async (data: CreateEducationCycleDto): Promise<EducationCycleDto> => {
  const response = await apiPost<ApiEducationCycleResponseDto>('/education-cycles', data);
  return mapToEducationCycleDto(response);
};

export const updateEducationCycle = async (id: string, data: UpdateEducationCycleDto): Promise<EducationCycleDto> => {
  const response = await apiPut<ApiEducationCycleResponseDto>(`/education-cycles/${id}`, data);
  return mapToEducationCycleDto(response);
};

export const deleteEducationCycle = async (id: string): Promise<void> => {
  return apiDelete(`/education-cycles/${id}`);
};

export const educationCycleService = {
  getEducationCycles,
  getEducationCycleById,
  createEducationCycle,
  updateEducationCycle,
  deleteEducationCycle,
};