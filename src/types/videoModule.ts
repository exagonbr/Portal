import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade VideoModule, usado no frontend
export interface VideoModuleDto extends BaseEntityDto {
  collection_id: UUID;
  module_number: number;
  title: string;
  synopsis: string;
  release_year: number;
  duration: string;
  education_cycle: string;
  poster_image_url?: string;
  video_url?: string;
  order_in_module: number;
}

// DTO para criação de VideoModule
export interface CreateVideoModuleDto {
  collection_id: UUID;
  module_number: number;
  title: string;
  synopsis: string;
  release_year: number;
  duration: string;
  education_cycle: string;
  poster_image_url?: string;
  video_url?: string;
  order_in_module?: number;
}

// DTO para atualização de VideoModule
export interface UpdateVideoModuleDto {
  collection_id?: UUID;
  module_number?: number;
  title?: string;
  synopsis?: string;
  release_year?: number;
  duration?: string;
  education_cycle?: string;
  poster_image_url?: string;
  video_url?: string;
  order_in_module?: number;
}

// Interface para filtros de VideoModule
export interface VideoModuleFilter extends BaseFilter {
  collection_id?: UUID;
  education_cycle?: string;
}