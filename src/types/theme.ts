import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade Theme, usado no frontend
export interface ThemeDto extends BaseEntityDto {
  name: string;
  description: string;
  is_active: boolean;
}

// DTO para criação de Theme
export interface CreateThemeDto {
  name: string;
  description: string;
  is_active?: boolean;
}

// DTO para atualização de Theme
export interface UpdateThemeDto {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Interface para filtros de Theme
export interface ThemeFilter extends BaseFilter {
  is_active?: boolean;
}