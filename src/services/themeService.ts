import {
  ThemeDto,
  CreateThemeDto,
  UpdateThemeDto,
  ThemeFilter,
} from '@/types/theme';
import {
  PaginatedResponse,
  ThemeResponseDto as ApiThemeResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToThemeDto = (data: ApiThemeResponseDto): ThemeDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  is_active: data.is_active || false,
  created_at: new Date().toISOString(), // API não parece fornecer
  updated_at: new Date().toISOString(), // API não parece fornecer
});

export const getThemes = async (params: ThemeFilter): Promise<PaginatedResponse<ThemeDto>> => {
  const response = await apiGet<PaginatedResponse<ApiThemeResponseDto>>('/themes', params);
  return {
    ...response,
    items: response.items.map(mapToThemeDto),
  };
};

export const getThemeById = async (id: number): Promise<ThemeDto> => {
  const response = await apiGet<ApiThemeResponseDto>(`/themes/${id}`);
  return mapToThemeDto(response);
};

export const createTheme = async (data: CreateThemeDto): Promise<ThemeDto> => {
  const response = await apiPost<ApiThemeResponseDto>('/themes', data);
  return mapToThemeDto(response);
};

export const updateTheme = async (id: number, data: UpdateThemeDto): Promise<ThemeDto> => {
  const response = await apiPut<ApiThemeResponseDto>(`/themes/${id}`, data);
  return mapToThemeDto(response);
};

export const deleteTheme = async (id: number): Promise<void> => {
  return apiDelete(`/themes/${id}`);
};

export const toggleThemeStatus = async (id: number): Promise<ThemeDto> => {
    const theme = await getThemeById(id);
    const response = await apiPatch<ApiThemeResponseDto>(`/themes/${id}/status`, { active: !theme.is_active });
    return mapToThemeDto(response);
};

export const themeService = {
  getThemes,
  getThemeById,
  createTheme,
  updateTheme,
  deleteTheme,
  toggleThemeStatus,
};