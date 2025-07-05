import { InstitutionDto } from './InstitutionDto'; // Para incluir dados da instituição
import { UserResponseDto as UserDto } from './UserDto'; // Corrigido para UserResponseDto e usando alias UserDto
import { ModuleDto } from './ModuleDto'; // Supondo que ModuleDto existirá
import { PaginationParams, PaginationResult } from '../types/common';

// Definindo tipos locais para evitar erros de import
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface CourseDto {
  id: string;
  name: string;
  description?: string;
  level: CourseLevel;
  cycle: string;
  stage?: string;
  duration?: string;
  schedule?: any; // Manter any por enquanto, ou definir uma interface se a estrutura for fixa
  institution_id: string;
  institution?: InstitutionDto; // Dados da instituição aninhados
  modules?: ModuleDto[]; // Lista de módulos
  teachers?: UserDto[]; // Lista de professores
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseDto {
  name: string;
  description?: string;
  level: CourseLevel;
  cycle: string;
  stage?: string;
  duration?: string;
  schedule?: any;
  institution_id: string;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  level?: CourseLevel;
  cycle?: string;
  stage?: string;
  duration?: string;
  schedule?: any;
  institution_id?: string; // Permitir alterar a instituição? Geralmente não.
}

export interface CourseFilterDto extends PaginationParams {
  search?: string;
  institution_id?: string;
  level?: CourseLevel;
  cycle?: string;
  stage?: string;
  sortBy?: keyof CourseDto; // Ordenar por campos do DTO
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCoursesDto {
  courses: CourseDto[];
  pagination: PaginationResult;
}

// DTOs para operações específicas do CourseController antigo
export interface AddRemoveTeacherStudentDto {
  userId: string;
}

export interface UpdateStudentProgressDto {
  progress: number; // Ex: 0-100
  grades?: Record<string, number | string>; // Ex: { "module1_quiz": 85, "final_exam": "A" }
}