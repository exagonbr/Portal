import { BaseEntityDto, BaseFilter } from './common';

// DTO para a entidade EducationalStage, usado no frontend
export interface EducationalStageDto extends BaseEntityDto {
  name: string;
  deleted: boolean;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
}

// DTO para criação de EducationalStage
export interface CreateEducationalStageDto {
  name: string;
  deleted?: boolean;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
}

// DTO para atualização de EducationalStage
export interface UpdateEducationalStageDto {
  name?: string;
  deleted?: boolean;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
}

// Interface para filtros de EducationalStage
export interface EducationalStageFilter extends BaseFilter {
  name?: string;
  deleted?: boolean;
}