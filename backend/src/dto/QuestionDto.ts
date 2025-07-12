import { BaseEntity } from '../types/common';

export interface QuestionDto {
  id: number;
  version?: number;
  dateCreated: Date;
  deleted?: boolean;
  fileId?: number;
  lastUpdated: Date;
  test?: string;
  tvShowId?: number;
  episodeId?: number;
}

export interface CreateQuestionDto {
  version?: number;
  deleted?: boolean;
  fileId?: number;
  test?: string;
  tvShowId?: number;
  episodeId?: number;
}

export interface UpdateQuestionDto {
  version?: number;
  deleted?: boolean;
  fileId?: number;
  test?: string;
  tvShowId?: number;
  episodeId?: number;
}

export interface QuestionFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  deleted?: boolean;
  tvShowId?: number;
  episodeId?: number;
  fileId?: number;
}

export interface QuestionResponseDto {
  success: boolean;
  data?: QuestionDto | QuestionDto[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}