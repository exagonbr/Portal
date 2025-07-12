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
  try {
    console.log('Chamando API de autores com parâmetros:', params);
    const response = await apiGet<any>('/authors', params);
    console.log('Resposta bruta da API de autores:', JSON.stringify(response));
    
    // Valores padrão para paginação
    const page = params.page || 1;
    const limit = params.limit || 10;
    
    // Verificar o formato da resposta e adaptar conforme necessário
    if (response && response.items && Array.isArray(response.items)) {
      console.log('Formato detectado: { items: [...], total: number }');
      return {
        ...response,
        items: response.items.map(mapToAuthorDto),
        page: response.page || page,
        limit: response.limit || limit,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || limit))
      };
    } else if (response && Array.isArray(response)) {
      console.log('Formato detectado: array direto de autores');
      const total = response.length;
      return {
        items: response.map(mapToAuthorDto),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } else if (response && response.data && Array.isArray(response.data)) {
      console.log('Formato detectado: { data: [...], total: number }');
      const total = response.total || response.data.length;
      return {
        items: response.data.map(mapToAuthorDto),
        total,
        page: response.page || page,
        limit: response.limit || limit,
        totalPages: response.totalPages || Math.ceil(total / limit)
      };
    } else if (response && typeof response === 'object') {
      // Tentar encontrar um array em alguma propriedade do objeto
      console.log('Formato desconhecido, tentando identificar array em alguma propriedade');
      const keys = Object.keys(response);
      console.log('Propriedades disponíveis:', keys);
      
      for (const key of keys) {
        if (Array.isArray(response[key])) {
          console.log(`Array encontrado na propriedade '${key}'`);
          const items = response[key];
          const total = items.length;
          return {
            items: items.map(mapToAuthorDto),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          };
        }
      }
      
      console.error('Nenhum array encontrado na resposta:', response);
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    } else {
      // Caso não consiga identificar o formato, retornar array vazio
      console.error('Formato de resposta inesperado da API de autores:', response);
      return {
        items: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0
    };
  }
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