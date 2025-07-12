import { BaseEntity } from '../types/common';

export interface AnswerDto {
  id: number;
  version?: number;
  dateCreated: Date;
  deleted?: boolean;
  isCorrect?: boolean;
  lastUpdated: Date;
  questionId?: number;
  reply?: string;
}

export interface CreateAnswerDto {
  version?: number;
  deleted?: boolean;
  isCorrect?: boolean;
  questionId?: number;
  reply?: string;
}

export interface UpdateAnswerDto {
  version?: number;
  deleted?: boolean;
  isCorrect?: boolean;
  questionId?: number;
  reply?: string;
}

export interface AnswerFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  deleted?: boolean;
  isCorrect?: boolean;
  questionId?: number;
}

export interface AnswerResponseDto {
  success: boolean;
  data?: AnswerDto | AnswerDto[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}