import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade Module, usado no frontend
export interface ModuleDto extends BaseEntityDto {
  name: string;
  description: string;
  cover_image: string;
  order: number;
  collection_id: UUID;
}

// DTO para criação de Module
export interface CreateModuleDto {
  name: string;
  description: string;
  cover_image: string;
  order: number;
  collection_id: UUID;
}

// DTO para atualização de Module
export interface UpdateModuleDto {
  name?: string;
  description?: string;
  cover_image?: string;
  order?: number;
  collection_id?: UUID;
}

// Interface para filtros de Module
export interface ModuleFilter extends BaseFilter {
  collection_id?: UUID;
}