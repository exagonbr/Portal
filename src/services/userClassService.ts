import {
  UserClassDto,
  CreateUserClassDto,
  UpdateUserClassDto,
  UserClassFilter,
  UserClassRole,
} from '@/types/userClass';
import {
  PaginatedResponse,
  UserClassResponseDto as ApiUserClassResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToUserClassDto = (data: ApiUserClassResponseDto): UserClassDto => ({
  id: data.id,
  user_id: data.user_id,
  user_name: data.user_name,
  class_id: data.class_id,
  class_name: data.class_name,
  role: data.role as UserClassRole,
  enrollment_date: data.enrollment_date,
  exit_date: data.exit_date,
  is_active: data.is_active,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getUserClasses = async (params: UserClassFilter): Promise<PaginatedResponse<UserClassDto>> => {
  try {
    const response = await apiGet<any>('/user-classes', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de user classes:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiUserClassResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para user classes:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToUserClassDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar user classes:', error);
    
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

export const getUserClassById = async (id: string): Promise<UserClassDto> => {
  const response = await apiGet<ApiUserClassResponseDto>(`/user-classes/${id}`);
  return mapToUserClassDto(response);
};

export const createUserClass = async (data: CreateUserClassDto): Promise<UserClassDto> => {
  const response = await apiPost<ApiUserClassResponseDto>('/user-classes', data);
  return mapToUserClassDto(response);
};

export const updateUserClass = async (id: string, data: UpdateUserClassDto): Promise<UserClassDto> => {
  const response = await apiPut<ApiUserClassResponseDto>(`/user-classes/${id}`, data);
  return mapToUserClassDto(response);
};

export const deleteUserClass = async (id: string): Promise<void> => {
  return apiDelete(`/user-classes/${id}`);
};

export const toggleUserClassStatus = async (id: string): Promise<UserClassDto> => {
    const userClass = await getUserClassById(id);
    const response = await apiPatch<ApiUserClassResponseDto>(`/user-classes/${id}/status`, { active: !userClass.is_active });
    return mapToUserClassDto(response);
};

export const userClassService = {
  getUserClasses,
  getUserClassById,
  createUserClass,
  updateUserClass,
  deleteUserClass,
  toggleUserClassStatus,
};