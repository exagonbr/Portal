import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade Collection, usado no frontend
export interface CollectionDto extends BaseEntityDto {
  name: string;
  synopsis: string;
  cover_image: string;
  support_material?: string;
  total_duration: number;
  subject: string;
  tags: string[];
  created_by: UUID;
}

// DTO para criação de Collection
export interface CreateCollectionDto {
  name: string;
  synopsis: string;
  cover_image: string;
  support_material?: string;
  total_duration: number;
  subject: string;
  tags?: string[];
  created_by: UUID;
}

// DTO para atualização de Collection
export interface UpdateCollectionDto {
  name?: string;
  synopsis?: string;
  cover_image?: string;
  support_material?: string;
  total_duration?: number;
  subject?: string;
  tags?: string[];
}

// Interface para filtros de Collection
export interface CollectionFilter extends BaseFilter {
  subject?: string;
  tags?: string;
  created_by?: UUID;
}