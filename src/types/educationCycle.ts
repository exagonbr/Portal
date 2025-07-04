import { BaseEntityDto, BaseFilter } from './common';

export enum EducationLevel {
  EDUCACAO_INFANTIL = 'EDUCACAO_INFANTIL',
  ENSINO_FUNDAMENTAL_I = 'ENSINO_FUNDAMENTAL_I',
  ENSINO_FUNDAMENTAL_II = 'ENSINO_FUNDAMENTAL_II',
  ENSINO_MEDIO = 'ENSINO_MEDIO',
  ENSINO_TECNICO = 'ENSINO_TECNICO',
  ENSINO_SUPERIOR = 'ENSINO_SUPERIOR'
}

// DTO para a entidade EducationCycle, usado no frontend
export interface EducationCycleDto extends BaseEntityDto {
  name: string;
  level: EducationLevel;
  description?: string;
  duration_years: number;
  min_age?: number;
  max_age?: number;
}

// DTO para criação de EducationCycle
export interface CreateEducationCycleDto {
  name: string;
  level: EducationLevel;
  description?: string;
  duration_years: number;
  min_age?: number;
  max_age?: number;
}

// DTO para atualização de EducationCycle
export interface UpdateEducationCycleDto {
  name?: string;
  level?: EducationLevel;
  description?: string;
  duration_years?: number;
  min_age?: number;
  max_age?: number;
}

// Interface para filtros de EducationCycle
export interface EducationCycleFilter extends BaseFilter {
  level?: EducationLevel;
}