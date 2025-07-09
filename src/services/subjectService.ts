import {
  SubjectDto,
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectFilter,
} from '@/types/subject';
import {
  PaginatedResponse,
  SubjectResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToSubjectDto = (data: SubjectResponseDto): SubjectDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  is_active: data.is_active,
  created_at: data.created_at || new Date().toISOString(),
  updated_at: data.updated_at || new Date().toISOString(),
});

export const getSubjects = async (params: SubjectFilter): Promise<PaginatedResponse<SubjectDto>> => {
  try {
    const response = await apiGet<any>('/subjects', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de subjects:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: SubjectResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para subjects:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToSubjectDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar subjects:', error);
    
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

export const getSubjectById = async (id: number): Promise<SubjectDto> => {
  const response = await apiGet<SubjectResponseDto>(`/subjects/${id}`);
  return mapToSubjectDto(response);
};

export const createSubject = async (data: CreateSubjectDto): Promise<SubjectDto> => {
  const response = await apiPost<SubjectResponseDto>('/subjects', data);
  return mapToSubjectDto(response);
};

export const updateSubject = async (id: number, data: UpdateSubjectDto): Promise<SubjectDto> => {
  const response = await apiPut<SubjectResponseDto>(`/subjects/${id}`, data);
  return mapToSubjectDto(response);
};

export const deleteSubject = async (id: number): Promise<void> => {
  return apiDelete(`/subjects/${id}`);
};

export const toggleSubjectStatus = async (id: number): Promise<SubjectDto> => {
  const response = await apiPatch<SubjectResponseDto>(`/subjects/${id}/toggle-status`, {});
  return mapToSubjectDto(response);
};

export const subjectService = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleSubjectStatus,
};