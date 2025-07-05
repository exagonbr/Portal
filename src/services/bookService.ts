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
  const response = await apiGet<PaginatedResponse<ApiBookResponseDto>>('/books', params);
  return {
    ...response,
    items: response.items.map(mapToBookDto),
  };
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