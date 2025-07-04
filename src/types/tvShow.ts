import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade TvShow, usado no frontend
export interface TvShowDto extends BaseEntityDto {
  name: string;
  overview?: string;
  producer?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date: string;
  contract_term_end: string;
  is_active: boolean;
}

// DTO para criação de TvShow
export interface CreateTvShowDto {
  name: string;
  overview?: string;
  producer?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date: string;
  contract_term_end: string;
  is_active?: boolean;
}

// DTO para atualização de TvShow
export interface UpdateTvShowDto {
  name?: string;
  overview?: string;
  producer?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date?: string;
  contract_term_end?: string;
  is_active?: boolean;
}

// Interface para filtros de TvShow
export interface TvShowFilter extends BaseFilter {
  producer?: string;
  is_active?: boolean;
}