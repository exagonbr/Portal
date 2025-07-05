import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade EducationPeriod, usado no frontend
export interface EducationPeriodDto extends BaseEntityDto {
  description: string;
  is_active: boolean;
}

// DTO para criação de EducationPeriod
export interface CreateEducationPeriodDto {
  description: string;
  is_active?: boolean;
}

// DTO para atualização de EducationPeriod
export interface UpdateEducationPeriodDto {
  description?: string;
  is_active?: boolean;
}

// Interface para filtros de EducationPeriod
export interface EducationPeriodFilter extends BaseFilter {
  is_active?: boolean;
}