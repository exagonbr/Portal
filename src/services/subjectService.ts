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
  const response = await apiGet<PaginatedResponse<SubjectResponseDto>>('/subjects', params);
  return {
    ...response,
    items: response.items.map(mapToSubjectDto),
  };
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