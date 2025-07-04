import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade Video, usado no frontend
export interface VideoDto extends BaseEntityDto {
  title?: string;
  overview?: string;
  release_date?: string;
  duration?: string;
  show_id?: UUID;
  season_number?: number;
  episode_number?: number;
}

// DTO para criação de Video
export interface CreateVideoDto {
  title: string;
  show_id: UUID;
  overview?: string;
  release_date?: string;
  duration?: string;
  season_number?: number;
  episode_number?: number;
}

// DTO para atualização de Video
export interface UpdateVideoDto {
  title?: string;
  overview?: string;
  release_date?: string;
  duration?: string;
  season_number?: number;
  episode_number?: number;
}

// Interface para filtros de Video
export interface VideoFilter extends BaseFilter {
  show_id?: UUID;
  season_number?: number;
}