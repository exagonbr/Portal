import { BaseEntity } from '../types/common';

export interface CreateGenreDto {
  api_id: number;
  name: string;
}

export interface UpdateGenreDto {
  api_id?: number;
  name?: string;
}

export interface GenreResponseDto extends BaseEntity {
  id: string;
  version?: number;
  api_id: number;
  name: string;
}