import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade VideoCollection, usado no frontend
export interface VideoCollectionDto extends BaseEntityDto {
  name: string;
  synopsis?: string;
  producer?: string;
  release_date?: string;
  contract_expiry_date?: string;
  authors: string[];
  target_audience: string[];
  total_hours: string;
  poster_image_url?: string;
  carousel_image_url?: string;
  ebook_file_url?: string;
  use_default_cover_for_videos: boolean;
  deleted: boolean;
}

// DTO para criação de VideoCollection
export interface CreateVideoCollectionDto {
  name: string;
  synopsis?: string;
  producer?: string;
  release_date?: string;
  contract_expiry_date?: string;
  authors: string[];
  target_audience: string[];
  total_hours: string;
  poster_image_url?: string;
  carousel_image_url?: string;
  ebook_file_url?: string;
  use_default_cover_for_videos?: boolean;
  deleted?: boolean;
}

// DTO para atualização de VideoCollection
export interface UpdateVideoCollectionDto {
  name?: string;
  synopsis?: string;
  producer?: string;
  release_date?: string;
  contract_expiry_date?: string;
  authors?: string[];
  target_audience?: string[];
  total_hours?: string;
  poster_image_url?: string;
  carousel_image_url?: string;
  ebook_file_url?: string;
  use_default_cover_for_videos?: boolean;
  deleted?: boolean;
}

// Interface para filtros de VideoCollection
export interface VideoCollectionFilter extends BaseFilter {
  producer?: string;
  author?: string;
  target_audience?: string;
}