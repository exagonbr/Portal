import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade School, usado no frontend
export interface SchoolDto extends BaseEntityDto {
  name: string;
  code: string;
  institution_id: UUID;
  institution_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_active: boolean;
  students_count?: number;
  teachers_count?: number;
  classes_count?: number;
}

// DTO para criação de School
export interface CreateSchoolDto {
  name: string;
  code: string;
  institution_id: UUID;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_active?: boolean;
}

// DTO para atualização de School
export interface UpdateSchoolDto {
  name?: string;
  code?: string;
  institution_id?: UUID;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_active?: boolean;
}

// Interface para filtros de School
export interface SchoolFilter extends BaseFilter {
  institution_id?: UUID;
  is_active?: boolean;
  state?: string;
  city?: string;
}