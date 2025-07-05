import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade Author, usado no frontend
export interface AuthorDto extends BaseEntityDto {
  name: string;
  description: string;
  email?: string;
  is_active: boolean;
}

// DTO para criação de Author
export interface CreateAuthorDto {
  name: string;
  description: string;
  email?: string;
  is_active?: boolean;
}

// DTO para atualização de Author
export interface UpdateAuthorDto {
  name?: string;
  description?: string;
  email?: string;
  is_active?: boolean;
}

// Interface para filtros de Author
export interface AuthorFilter extends BaseFilter {
  is_active?: boolean;
}