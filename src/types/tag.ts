import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade Tag, usado no frontend
export interface TagDto extends BaseEntityDto {
  name: string;
  deleted?: boolean;
}

// DTO para criação de Tag
export interface CreateTagDto {
  name: string;
  deleted?: boolean;
}

// DTO para atualização de Tag
export interface UpdateTagDto {
  name?: string;
  deleted?: boolean;
}

// Interface para filtros de Tag
export interface TagFilter extends BaseFilter {
  name?: string;
  deleted?: boolean;
}