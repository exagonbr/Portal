import {
  LanguageDto,
  CreateLanguageDto,
  UpdateLanguageDto,
  LanguageFilter,
} from '@/types/language';
import {
  PaginatedResponse,
  LanguageResponseDto as ApiLanguageResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToLanguageDto = (data: ApiLanguageResponseDto): LanguageDto => ({
  id: String(data.id),
  name: data.name,
  code: data.code,
  is_active: data.is_active,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getLanguages = async (params: LanguageFilter): Promise<PaginatedResponse<LanguageDto>> => {
  try {
    const response = await apiGet<any>('/languages', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de languages:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiLanguageResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para languages:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToLanguageDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar languages:', error);
    
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

export const getLanguageById = async (id: number): Promise<LanguageDto> => {
  const response = await apiGet<ApiLanguageResponseDto>(`/languages/${id}`);
  return mapToLanguageDto(response);
};

export const createLanguage = async (data: CreateLanguageDto): Promise<LanguageDto> => {
  const response = await apiPost<ApiLanguageResponseDto>('/languages', data);
  return mapToLanguageDto(response);
};

export const updateLanguage = async (id: number, data: UpdateLanguageDto): Promise<LanguageDto> => {
  const response = await apiPut<ApiLanguageResponseDto>(`/languages/${id}`, data);
  return mapToLanguageDto(response);
};

export const deleteLanguage = async (id: number): Promise<void> => {
  return apiDelete(`/languages/${id}`);
};

export const toggleLanguageStatus = async (id: number): Promise<LanguageDto> => {
    const language = await getLanguageById(id);
    const response = await apiPatch<ApiLanguageResponseDto>(`/languages/${id}/status`, { active: !language.is_active });
    return mapToLanguageDto(response);
};

export const languageService = {
  getLanguages,
  getLanguageById,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  toggleLanguageStatus,
};