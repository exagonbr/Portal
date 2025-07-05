import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade MediaEntry, usado no frontend
export interface MediaEntryDto extends BaseEntityDto {
  name?: string;
  description?: string;
  type?: string;
  url?: string;
  thumbnail?: string;
  author_id?: UUID;
  publisher_id?: UUID;
  genre_id?: UUID;
  subject_id?: UUID;
  is_active: boolean;
}

// DTO para criação de MediaEntry
export interface CreateMediaEntryDto {
  name: string;
  type: string;
  url: string;
  description?: string;
  thumbnail?: string;
  author_id?: UUID;
  publisher_id?: UUID;
  genre_id?: UUID;
  subject_id?: UUID;
  is_active?: boolean;
}

// DTO para atualização de MediaEntry
export interface UpdateMediaEntryDto {
  name?: string;
  type?: string;
  url?: string;
  description?: string;
  thumbnail?: string;
  author_id?: UUID;
  publisher_id?: UUID;
  genre_id?: UUID;
  subject_id?: UUID;
  is_active?: boolean;
}

// Interface para filtros de MediaEntry
export interface MediaEntryFilter extends BaseFilter {
  type?: string;
  author_id?: UUID;
  publisher_id?: UUID;
  genre_id?: UUID;
  subject_id?: UUID;
  is_active?: boolean;
}