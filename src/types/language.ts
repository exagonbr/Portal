import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade Language, usado no frontend
export interface LanguageDto extends BaseEntityDto {
  name: string;
  code: string;
  is_active: boolean;
}

// DTO para criação de Language
export interface CreateLanguageDto {
  name: string;
  code: string;
  is_active?: boolean;
}

// DTO para atualização de Language
export interface UpdateLanguageDto {
  name?: string;
  code?: string;
  is_active?: boolean;
}

// Interface para filtros de Language
export interface LanguageFilter extends BaseFilter {
  is_active?: boolean;
}