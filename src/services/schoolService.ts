import {
  SchoolDto,
  CreateSchoolDto,
  UpdateSchoolDto,
  SchoolFilter,
} from '@/types/school';
import {
  PaginatedResponse,
  SchoolResponseDto as ApiSchoolResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToSchoolDto = (data: ApiSchoolResponseDto): SchoolDto => ({
  id: String(data.id),
  name: data.name,
  code: '', // API não parece fornecer, deixar em branco
  institution_id: String(data.institutionId),
  institution_name: data.institutionName,
  address: '', // API não parece fornecer
  city: '', // API não parece fornecer
  state: '', // API não parece fornecer
  zip_code: '', // API não parece fornecer
  is_active: !data.deleted,
  students_count: data.total_students,
  teachers_count: data.total_teachers,
  classes_count: data.total_classes,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
});

export const getSchools = async (params: SchoolFilter): Promise<PaginatedResponse<SchoolDto>> => {
  try {
    const response = await apiGet<any>('/schools', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de schools:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiSchoolResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para schools:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToSchoolDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar schools:', error);
    
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

export const getSchoolById = async (id: number): Promise<SchoolDto> => {
  const response = await apiGet<ApiSchoolResponseDto>(`/schools/${id}`);
  return mapToSchoolDto(response);
};

export const createSchool = async (data: CreateSchoolDto): Promise<SchoolDto> => {
  const response = await apiPost<ApiSchoolResponseDto>('/schools', data);
  return mapToSchoolDto(response);
};

export const updateSchool = async (id: number, data: UpdateSchoolDto): Promise<SchoolDto> => {
  const response = await apiPut<ApiSchoolResponseDto>(`/schools/${id}`, data);
  return mapToSchoolDto(response);
};

export const deleteSchool = async (id: number): Promise<void> => {
  return apiDelete(`/schools/${id}`);
};

export const toggleSchoolStatus = async (id: number): Promise<SchoolDto> => {
  const school = await getSchoolById(id);
  const response = await apiPatch<ApiSchoolResponseDto>(`/schools/${id}/status`, { active: !school.is_active });
  return mapToSchoolDto(response);
};

export const schoolService = {
  getSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
  toggleSchoolStatus,
};

export default schoolService;