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
  const response = await apiGet<PaginatedResponse<ApiSchoolResponseDto>>('/schools', params);
  return {
    ...response,
    items: response.items.map(mapToSchoolDto),
  };
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