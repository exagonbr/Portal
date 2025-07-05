import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade Subject, usado no frontend
export interface SubjectDto extends BaseEntityDto {
  name: string;
  description: string;
  is_active: boolean;
}

// DTO para criação de Subject
export interface CreateSubjectDto {
  name: string;
  description: string;
  is_active?: boolean;
}

// DTO para atualização de Subject
export interface UpdateSubjectDto {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Interface para filtros de Subject
export interface SubjectFilter extends BaseFilter {
  is_active?: boolean;
}