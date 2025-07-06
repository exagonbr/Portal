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
const mapToAuthorDto = (data: any): AuthorDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  email: data.email,
  is_active: data.isActive || false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Função para mapear o DTO do frontend para o formato do backend
const mapToApiAuthorDto = (data: CreateAuthorDto | UpdateAuthorDto) => ({
  name: data.name,
  description: data.description,
  email: data.email,
  isActive: data.is_active,
});

export const getAuthors = async (params: AuthorFilter): Promise<PaginatedResponse<AuthorDto>> => {
  const response = await apiGet<PaginatedResponse<any>>('/authors', params);
  return {
    ...response,
    items: response.items.map(mapToAuthorDto),
  };
};

export const getAuthorById = async (id: number): Promise<AuthorDto> => {
  const response = await apiGet<any>(`/authors/${id}`);
  return mapToAuthorDto(response);
};

export const createAuthor = async (data: CreateAuthorDto): Promise<AuthorDto> => {
  const apiData = mapToApiAuthorDto(data);
  const response = await apiPost<any>('/authors', apiData);
  return mapToAuthorDto(response);
};

export const updateAuthor = async (id: number, data: UpdateAuthorDto): Promise<AuthorDto> => {
  const apiData = mapToApiAuthorDto(data);
  const response = await apiPut<any>(`/authors/${id}`, apiData);
  return mapToAuthorDto(response);
};

export const deleteAuthor = async (id: number): Promise<void> => {
  return apiDelete(`/authors/${id}`);
};

export const toggleAuthorStatus = async (id: number): Promise<AuthorDto> => {
  const response = await apiPatch<any>(`/authors/${id}/status`, {});
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