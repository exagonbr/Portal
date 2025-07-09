import {
  SchoolManagerDto,
  CreateSchoolManagerDto,
  UpdateSchoolManagerDto,
  SchoolManagerFilter,
  ManagerPosition,
} from '@/types/schoolManager';
import {
  PaginatedResponse,
  SchoolManagerResponseDto as ApiSchoolManagerResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToSchoolManagerDto = (data: ApiSchoolManagerResponseDto): SchoolManagerDto => ({
  id: data.id,
  user_id: data.user_id,
  user_name: data.user_name,
  school_id: data.school_id,
  school_name: data.school_name,
  position: data.position as ManagerPosition,
  start_date: data.start_date,
  end_date: data.end_date,
  is_active: data.is_active,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getSchoolManagers = async (params: SchoolManagerFilter): Promise<PaginatedResponse<SchoolManagerDto>> => {
  try {
    const response = await apiGet<any>('/school-managers', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de school managers:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiSchoolManagerResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para school managers:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToSchoolManagerDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar school managers:', error);
    
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

export const getSchoolManagerById = async (id: string): Promise<SchoolManagerDto> => {
  const response = await apiGet<ApiSchoolManagerResponseDto>(`/school-managers/${id}`);
  return mapToSchoolManagerDto(response);
};

export const createSchoolManager = async (data: CreateSchoolManagerDto): Promise<SchoolManagerDto> => {
  const response = await apiPost<ApiSchoolManagerResponseDto>('/school-managers', data);
  return mapToSchoolManagerDto(response);
};

export const updateSchoolManager = async (id: string, data: UpdateSchoolManagerDto): Promise<SchoolManagerDto> => {
  const response = await apiPut<ApiSchoolManagerResponseDto>(`/school-managers/${id}`, data);
  return mapToSchoolManagerDto(response);
};

export const deleteSchoolManager = async (id: string): Promise<void> => {
  return apiDelete(`/school-managers/${id}`);
};

export const toggleSchoolManagerStatus = async (id: string): Promise<SchoolManagerDto> => {
    const manager = await getSchoolManagerById(id);
    const response = await apiPatch<ApiSchoolManagerResponseDto>(`/school-managers/${id}/status`, { active: !manager.is_active });
    return mapToSchoolManagerDto(response);
};

export const schoolManagerService = {
  getSchoolManagers,
  getSchoolManagerById,
  createSchoolManager,
  updateSchoolManager,
  deleteSchoolManager,
  toggleSchoolManagerStatus,
};