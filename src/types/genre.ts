import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade Genre, usado no frontend
export interface GenreDto extends BaseEntityDto {
  name: string;
  api_id: number;
}

// DTO para criação de Genre
export interface CreateGenreDto {
  name: string;
  api_id: number;
}

// DTO para atualização de Genre
export interface UpdateGenreDto {
  name?: string;
  api_id?: number;
}

// Interface para filtros de Genre
export interface GenreFilter extends BaseFilter {
  name?: string;
}