import { BaseEntity } from '../types/common';

export interface CreateUserAnswerDto {
  answer_id: string;
  question_id: string;
  date_created: Date;
  is_correct?: boolean;
  last_updated?: Date;
  score?: number;
  user_id?: string | null;
}

export interface UpdateUserAnswerDto {
  answer_id?: string;
  question_id?: string;
  last_updated?: Date;
  is_correct?: boolean;
  score?: number;
  user_id?: string | null;
}

export interface UserAnswerResponseDto extends BaseEntity {
  id: string;
  answer_id: string;
  question_id: string;
  version?: number;
  date_created: string;
  is_correct?: boolean;
  last_updated?: string;
  score?: number;
  user_id?: string | null;
}