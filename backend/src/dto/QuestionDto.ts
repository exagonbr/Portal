import { BaseEntity } from '../types/common';

export interface CreateQuestionDto {
  date_created: Date;
  deleted?: boolean;
  file_id?: string | null;
  last_updated?: Date;
  test?: string;
  tv_show_id?: string | null;
  episode_id?: string | null;
}

export interface UpdateQuestionDto {
  last_updated?: Date;
  deleted?: boolean;
  file_id?: string | null;
  test?: string;
  tv_show_id?: string | null;
  episode_id?: string | null;
}

export interface QuestionResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created: string;
  deleted?: boolean;
  file_id?: string | null;
  last_updated?: string;
  test?: string;
  tv_show_id?: string | null;
  episode_id?: string | null;
}