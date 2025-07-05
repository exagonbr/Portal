import {
  QuizDto,
  CreateQuizDto,
  UpdateQuizDto,
  QuizFilter,
  QuestionDto,
} from '@/types/quiz';
import {
  PaginatedResponse,
  QuizResponseDto as ApiQuizResponseDto,
  QuestionResponseDto as ApiQuestionResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToQuestionDto = (data: ApiQuestionResponseDto): QuestionDto => ({
    id: String(data.id),
    quiz_id: data.quiz_id,
    type: data.type,
    text: data.text,
    options: data.options,
    correct_answer: data.correct_answer,
    points: data.points,
    explanation: data.explanation,
    created_at: data.created_at,
    updated_at: data.updated_at,
});

const mapToQuizDto = (data: ApiQuizResponseDto): QuizDto => ({
  id: data.id,
  title: data.title,
  description: data.description,
  time_limit: data.time_limit,
  passing_score: data.passing_score,
  attempts: data.attempts,
  is_graded: data.is_graded,
  questions: data.questions.map(mapToQuestionDto),
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getQuizzes = async (params: QuizFilter): Promise<PaginatedResponse<QuizDto>> => {
  const response = await apiGet<PaginatedResponse<ApiQuizResponseDto>>('/quizzes', params);
  return {
    ...response,
    items: response.items.map(mapToQuizDto),
  };
};

export const getQuizById = async (id: string): Promise<QuizDto> => {
  const response = await apiGet<ApiQuizResponseDto>(`/quizzes/${id}`);
  return mapToQuizDto(response);
};

export const createQuiz = async (data: CreateQuizDto): Promise<QuizDto> => {
  const response = await apiPost<ApiQuizResponseDto>('/quizzes', data);
  return mapToQuizDto(response);
};

export const updateQuiz = async (id: string, data: UpdateQuizDto): Promise<QuizDto> => {
  const response = await apiPut<ApiQuizResponseDto>(`/quizzes/${id}`, data);
  return mapToQuizDto(response);
};

export const deleteQuiz = async (id: string): Promise<void> => {
  return apiDelete(`/quizzes/${id}`);
};

export const quizService = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};