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
  try {
    const response = await apiGet<any>('/themes', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de themes:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiThemeResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para themes:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToThemeDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar themes:', error);
    
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