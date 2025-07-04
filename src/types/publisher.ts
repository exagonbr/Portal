import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade Publisher, usado no frontend
export interface PublisherDto extends BaseEntityDto {
  name: string;
  description: string;
  is_active: boolean;
}

// DTO para criação de Publisher
export interface CreatePublisherDto {
  name: string;
  description: string;
  is_active?: boolean;
}

// DTO para atualização de Publisher
export interface UpdatePublisherDto {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Interface para filtros de Publisher
export interface PublisherFilter extends BaseFilter {
  is_active?: boolean;
}