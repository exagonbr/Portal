import {
  CourseDto,
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilter,
} from '@/types/course';
import {
  PaginatedResponse,
  CourseResponseDto as ApiCourseResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToCourseDto = (data: ApiCourseResponseDto): CourseDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  institution_id: String(data.institution_id),
  institution_name: data.institution?.name,
  teacher_id: data.teachers?.[0]?.id ? String(data.teachers[0].id) : undefined,
  teacher_name: data.teachers?.[0]?.name,
  is_active: data.active,
  students_count: data.students?.length,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getCourses = async (params: CourseFilter): Promise<PaginatedResponse<CourseDto>> => {
  const response = await apiGet<PaginatedResponse<ApiCourseResponseDto>>('/courses', params);
  return {
    ...response,
    items: response.items.map(mapToCourseDto),
  };
};

export const getCourseById = async (id: number): Promise<CourseDto> => {
  const response = await apiGet<ApiCourseResponseDto>(`/courses/${id}`);
  return mapToCourseDto(response);
};

export const createCourse = async (data: CreateCourseDto): Promise<CourseDto> => {
  const response = await apiPost<ApiCourseResponseDto>('/courses', data);
  return mapToCourseDto(response);
};

export const updateCourse = async (id: number, data: UpdateCourseDto): Promise<CourseDto> => {
  const response = await apiPut<ApiCourseResponseDto>(`/courses/${id}`, data);
  return mapToCourseDto(response);
};

export const deleteCourse = async (id: number): Promise<void> => {
  return apiDelete(`/courses/${id}`);
};

export const toggleCourseStatus = async (id: number): Promise<CourseDto> => {
  const course = await getCourseById(id);
  const response = await apiPatch<ApiCourseResponseDto>(`/courses/${id}/status`, { active: !course.is_active });
  return mapToCourseDto(response);
};

export const getCoursesByTeacher = async (teacherId: string): Promise<CourseDto[]> => {
  const response = await apiGet<ApiCourseResponseDto[]>(`/courses/teacher/${teacherId}`);
  return response.map(mapToCourseDto);
};

export const getCoursesByStudent = async (studentId: string): Promise<CourseDto[]> => {
  const response = await apiGet<ApiCourseResponseDto[]>(`/courses/student/${studentId}`);
  return response.map(mapToCourseDto);
};

export const courseService = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  getCoursesByTeacher,
  getCoursesByStudent,
};