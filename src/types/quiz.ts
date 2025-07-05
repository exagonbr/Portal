import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade Question, usado no frontend
export interface QuestionDto extends BaseEntityDto {
  quiz_id: UUID;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  text: string;
  options?: string[];
  correct_answer: string | string[];
  points: number;
  explanation?: string;
}

// DTO para a entidade Quiz, usado no frontend
export interface QuizDto extends BaseEntityDto {
  title: string;
  description: string;
  time_limit?: number;
  passing_score: number;
  attempts: number;
  is_graded: boolean;
  questions: QuestionDto[];
}

// DTO para criação de Quiz
export interface CreateQuizDto {
  title: string;
  description: string;
  time_limit?: number;
  passing_score: number;
  attempts?: number;
  is_graded?: boolean;
  questions: Array<Omit<QuestionDto, 'id' | 'created_at' | 'updated_at'>>;
}

// DTO para atualização de Quiz
export interface UpdateQuizDto {
  title?: string;
  description?: string;
  time_limit?: number;
  passing_score?: number;
  attempts?: number;
  is_graded?: boolean;
}

// Interface para filtros de Quiz
export interface QuizFilter extends BaseFilter {
  is_graded?: boolean;
}