import {
  ClassDto,
  CreateClassDto,
  UpdateClassDto,
  ClassFilter,
  ShiftType,
} from '@/types/class';
import {
  PaginatedResponse,
  ClassResponseDto as ApiClassResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToClassDto = (data: ApiClassResponseDto): ClassDto => ({
  id: String(data.id),
  name: data.name,
  code: data.code,
  school_id: String(data.school_id),
  school_name: data.school_name,
  year: data.year,
  shift: data.shift as ShiftType,
  max_students: data.max_students,
  is_active: data.is_active,
  students_count: data.student_count,
  teacher_name: '', // API não parece fornecer
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getClasses = async (params: ClassFilter): Promise<PaginatedResponse<ClassDto>> => {
  const response = await apiGet<PaginatedResponse<ApiClassResponseDto>>('/classes', params);
  return {
    ...response,
    items: response.items.map(mapToClassDto),
  };
};

export const getClassById = async (id: number): Promise<ClassDto> => {
  const response = await apiGet<ApiClassResponseDto>(`/classes/${id}`);
  return mapToClassDto(response);
};

export const createClass = async (data: CreateClassDto): Promise<ClassDto> => {
  const response = await apiPost<ApiClassResponseDto>('/classes', data);
  return mapToClassDto(response);
};

export const updateClass = async (id: number, data: UpdateClassDto): Promise<ClassDto> => {
  const response = await apiPut<ApiClassResponseDto>(`/classes/${id}`, data);
  return mapToClassDto(response);
};

export const deleteClass = async (id: number): Promise<void> => {
  return apiDelete(`/classes/${id}`);
};

export const toggleClassStatus = async (id: number): Promise<ClassDto> => {
  const classData = await getClassById(id);
  const response = await apiPatch<ApiClassResponseDto>(`/classes/${id}/status`, { active: !classData.is_active });
  return mapToClassDto(response);
};

export const classService = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  toggleClassStatus,
};