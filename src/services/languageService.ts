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
  const response = await apiGet<PaginatedResponse<ApiLanguageResponseDto>>('/languages', params);
  return {
    ...response,
    items: response.items.map(mapToLanguageDto),
  };
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