import {
  AuthorDto,
  CreateAuthorDto,
  UpdateAuthorDto,
  AuthorFilter,
} from '@/types/author';
import {
  PaginatedResponse,
  AuthorResponseDto as ApiAuthorResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToAuthorDto = (data: ApiAuthorResponseDto): AuthorDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  email: data.email,
  is_active: data.is_active || false,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getAuthors = async (params: AuthorFilter): Promise<PaginatedResponse<AuthorDto>> => {
  const response = await apiGet<PaginatedResponse<ApiAuthorResponseDto>>('/authors', params);
  return {
    ...response,
    items: response.items.map(mapToAuthorDto),
  };
};

export const getAuthorById = async (id: number): Promise<AuthorDto> => {
  const response = await apiGet<ApiAuthorResponseDto>(`/authors/${id}`);
  return mapToAuthorDto(response);
};

export const createAuthor = async (data: CreateAuthorDto): Promise<AuthorDto> => {
  const response = await apiPost<ApiAuthorResponseDto>('/authors', data);
  return mapToAuthorDto(response);
};

export const updateAuthor = async (id: number, data: UpdateAuthorDto): Promise<AuthorDto> => {
  const response = await apiPut<ApiAuthorResponseDto>(`/authors/${id}`, data);
  return mapToAuthorDto(response);
};

export const deleteAuthor = async (id: number): Promise<void> => {
  return apiDelete(`/authors/${id}`);
};

export const toggleAuthorStatus = async (id: number): Promise<AuthorDto> => {
    const author = await getAuthorById(id);
    const response = await apiPatch<ApiAuthorResponseDto>(`/authors/${id}/status`, { active: !author.is_active });
    return mapToAuthorDto(response);
};

export const authorService = {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  toggleAuthorStatus,
};