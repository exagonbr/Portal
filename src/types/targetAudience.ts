import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade TargetAudience, usado no frontend
export interface TargetAudienceDto extends BaseEntityDto {
  name: string;
  description: string;
  is_active: boolean;
}

// DTO para criação de TargetAudience
export interface CreateTargetAudienceDto {
  name: string;
  description: string;
  is_active?: boolean;
}

// DTO para atualização de TargetAudience
export interface UpdateTargetAudienceDto {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Interface para filtros de TargetAudience
export interface TargetAudienceFilter extends BaseFilter {
  is_active?: boolean;
}