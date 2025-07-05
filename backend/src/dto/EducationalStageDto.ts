import { BaseEntity } from '../types/common';

export interface CreateEducationalStageDto {
  deleted: boolean;
  name: string;
  date_created?: Date;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  uuid?: string;
}

export interface UpdateEducationalStageDto {
  deleted?: boolean;
  name?: string;
  last_updated?: Date;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  uuid?: string;
}

export interface EducationalStageResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created?: string;
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
  last_updated?: string;
  name: string;
  uuid?: string;
}