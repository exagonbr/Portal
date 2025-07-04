import { BaseEntity } from '../types/common';

export interface CreateTvShowDto {
  contract_term_end: Date;
  date_created: Date;
  first_air_date: Date;
  last_updated: Date;
  name: string;
  api_id?: string;
  backdrop_image_id?: string | null;
  backdrop_path?: string;
  deleted?: boolean;
  imdb_id?: string;
  manual_input?: boolean;
  manual_support_id?: string | null;
  manual_support_path?: string;
  original_language?: string;
  overview?: string;
  popularity?: number;
  poster_image_id?: string | null;
  poster_path?: string;
  producer?: string;
  vote_average?: number;
  vote_count?: number;
  total_load?: string;
}

export interface UpdateTvShowDto {
  last_updated: Date;
  contract_term_end?: Date;
  first_air_date?: Date;
  name?: string;
  api_id?: string;
  backdrop_image_id?: string | null;
  backdrop_path?: string;
  deleted?: boolean;
  imdb_id?: string;
  manual_input?: boolean;
  manual_support_id?: string | null;
  manual_support_path?: string;
  original_language?: string;
  overview?: string;
  popularity?: number;
  poster_image_id?: string | null;
  poster_path?: string;
  producer?: string;
  vote_average?: number;
  vote_count?: number;
  total_load?: string;
}

export interface TvShowResponseDto extends BaseEntity {
  id: string;
  version?: number;
  api_id?: string;
  backdrop_image_id?: string | null;
  backdrop_path?: string;
  contract_term_end: string;
  date_created: string;
  deleted?: boolean;
  first_air_date: string;
  imdb_id?: string;
  last_updated: string;
  manual_input?: boolean;
  manual_support_id?: string | null;
  manual_support_path?: string;
  name: string;
  original_language?: string;
  overview?: string;
  popularity?: number;
  poster_image_id?: string | null;
  poster_path?: string;
  producer?: string;
  vote_average?: number;
  vote_count?: number;
  total_load?: string;
}