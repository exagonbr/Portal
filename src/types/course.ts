import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade Course, usado no frontend
export interface CourseDto extends BaseEntityDto {
  name: string;
  description?: string;
  institution_id: UUID;
  institution_name?: string;
  teacher_id?: UUID;
  teacher_name?: string;
  is_active: boolean;
  students_count?: number;
}

// DTO para criação de Course
export interface CreateCourseDto {
  name: string;
  description?: string;
  institution_id: UUID;
  teacher_id?: UUID;
  is_active?: boolean;
}

// DTO para atualização de Course
export interface UpdateCourseDto {
  name?: string;
  description?: string;
  institution_id?: UUID;
  teacher_id?: UUID;
  is_active?: boolean;
}

// Interface para filtros de Course
export interface CourseFilter extends BaseFilter {
  institution_id?: UUID;
  teacher_id?: UUID;
  is_active?: boolean;
}