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
  const response = await apiGet<PaginatedResponse<ApiSchoolManagerResponseDto>>('/school-managers', params);
  return {
    ...response,
    items: response.items.map(mapToSchoolManagerDto),
  };
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