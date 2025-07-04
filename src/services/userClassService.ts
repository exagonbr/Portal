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
  const response = await apiGet<PaginatedResponse<ApiUserClassResponseDto>>('/user-classes', params);
  return {
    ...response,
    items: response.items.map(mapToUserClassDto),
  };
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