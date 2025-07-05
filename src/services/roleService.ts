import {
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  RoleFilter,
} from '@/types/roles';
import {
  PaginatedResponse,
  RoleResponseDto as ApiRoleResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToRoleDto = (data: ApiRoleResponseDto): RoleDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  is_active: data.active,
  users_count: data.users_count,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getRoles = async (params: RoleFilter): Promise<PaginatedResponse<RoleDto>> => {
  const response = await apiGet<PaginatedResponse<ApiRoleResponseDto>>('/roles', params);
  return {
    ...response,
    items: response.items.map(mapToRoleDto),
  };
};

export const getRoleById = async (id: number): Promise<RoleDto> => {
  const response = await apiGet<ApiRoleResponseDto>(`/roles/${id}`);
  return mapToRoleDto(response);
};

export const createRole = async (data: CreateRoleDto): Promise<RoleDto> => {
  const response = await apiPost<ApiRoleResponseDto>('/roles', data);
  return mapToRoleDto(response);
};

export const updateRole = async (id: number, data: UpdateRoleDto): Promise<RoleDto> => {
  const response = await apiPut<ApiRoleResponseDto>(`/roles/${id}`, data);
  return mapToRoleDto(response);
};

export const deleteRole = async (id: number): Promise<void> => {
  return apiDelete(`/roles/${id}`);
};

export const toggleRoleStatus = async (id: number): Promise<RoleDto> => {
  const role = await getRoleById(id);
  const response = await apiPatch<ApiRoleResponseDto>(`/roles/${id}/status`, { active: !role.is_active });
  return mapToRoleDto(response);
};

export const roleService = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
};