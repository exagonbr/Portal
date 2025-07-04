import { BaseEntity } from '../types/common';

export interface CreateAnswerDto {
  date_created: Date;
  deleted?: boolean;
  is_correct?: boolean;
  last_updated?: Date;
  question_id?: string | null;
  reply?: string;
}

export interface UpdateAnswerDto {
  last_updated?: Date;
  deleted?: boolean;
  is_correct?: boolean;
  question_id?: string | null;
  reply?: string;
}

export interface AnswerResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created: string;
  deleted?: boolean;
  is_correct?: boolean;
  last_updated?: string;
  question_id?: string | null;
  reply?: string;
}