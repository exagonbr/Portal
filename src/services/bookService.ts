import {
  BookDto,
  CreateBookDto,
  UpdateBookDto,
  BookFilter,
} from '@/types/book';
import {
  PaginatedResponse,
  BookResponseDto as ApiBookResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToBookDto = (data: ApiBookResponseDto): BookDto => ({
  id: String(data.id),
  title: data.title,
  author: data.author,
  publisher: data.publisher,
  synopsis: data.synopsis,
  thumbnail: data.thumbnail,
  url: data.url,
  s3_key: data.s3_key,
  size: data.size,
  education_level: data.education_level,
  cycle: data.cycle,
  grade: data.grade,
  subject: data.subject,
  tags: data.tags,
  uploaded_by: data.uploaded_by,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getBooks = async (params: BookFilter): Promise<PaginatedResponse<BookDto>> => {
  try {
    const response = await apiGet<any>('/books', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de books:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiBookResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para books:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToBookDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar books:', error);
    
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

export const getBookById = async (id: number): Promise<BookDto> => {
  const response = await apiGet<ApiBookResponseDto>(`/books/${id}`);
  return mapToBookDto(response);
};

export const createBook = async (data: CreateBookDto): Promise<BookDto> => {
  const response = await apiPost<ApiBookResponseDto>('/books', data);
  return mapToBookDto(response);
};

export const updateBook = async (id: number, data: UpdateBookDto): Promise<BookDto> => {
  const response = await apiPut<ApiBookResponseDto>(`/books/${id}`, data);
  return mapToBookDto(response);
};

export const deleteBook = async (id: number): Promise<void> => {
  return apiDelete(`/books/${id}`);
};

export const bookService = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};