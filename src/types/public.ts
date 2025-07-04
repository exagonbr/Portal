import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade Public, usado no frontend
export interface PublicDto extends BaseEntityDto {
  name: string;
  api_id: number;
}

// DTO para criação de Public
export interface CreatePublicDto {
  name: string;
  api_id: number;
}

// DTO para atualização de Public
export interface UpdatePublicDto {
  name?: string;
  api_id?: number;
}

// Interface para filtros de Public
export interface PublicFilter extends BaseFilter {
  name?: string;
}