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
  try {
    const response = await apiGet<any>('/quizzes', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de quizzes:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiQuizResponseDto[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || 10;
    let totalPages = 0;

    // Verificar se a resposta tem o formato padrão PaginatedResponse
    if (response && response.items && Array.isArray(response.items)) {
      items = response.items;
      total = response.total || 0;
      page = response.page || page;
      limit = response.limit || limit;
      totalPages = response.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta tem formato ApiResponse com data
    else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      total = response.data.total || 0;
      page = response.data.page || page;
      limit = response.data.limit || limit;
      totalPages = response.data.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta é diretamente um array
    else if (response && Array.isArray(response)) {
      items = response;
      total = response.length;
      totalPages = Math.ceil(total / limit);
    }
    // Se não conseguiu identificar o formato, usar valores padrão
    else {
      console.warn('⚠️ [API] Formato de resposta não reconhecido para quizzes:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToQuizDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar quizzes:', error);
    
    // Retornar uma resposta vazia em caso de erro
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0,
    };
  }
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