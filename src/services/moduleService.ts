import {
  ModuleDto,
  CreateModuleDto,
  UpdateModuleDto,
  ModuleFilter,
} from '@/types/module';
import {
  PaginatedResponse,
  ModuleResponseDto as ApiModuleResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToModuleDto = (data: ApiModuleResponseDto): ModuleDto => ({
  id: data.id,
  name: data.name,
  description: data.description,
  cover_image: data.cover_image,
  order: data.order,
  collection_id: data.collection_id,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getModules = async (params: ModuleFilter): Promise<PaginatedResponse<ModuleDto>> => {
  const response = await apiGet<PaginatedResponse<ApiModuleResponseDto>>('/modules', params);
  return {
    ...response,
    items: response.items.map(mapToModuleDto),
  };
};

export const getModuleById = async (id: string): Promise<ModuleDto> => {
  const response = await apiGet<ApiModuleResponseDto>(`/modules/${id}`);
  return mapToModuleDto(response);
};

export const createModule = async (data: CreateModuleDto): Promise<ModuleDto> => {
  const response = await apiPost<ApiModuleResponseDto>('/modules', data);
  return mapToModuleDto(response);
};

export const updateModule = async (id: string, data: UpdateModuleDto): Promise<ModuleDto> => {
  const response = await apiPut<ApiModuleResponseDto>(`/modules/${id}`, data);
  return mapToModuleDto(response);
};

export const deleteModule = async (id: string): Promise<void> => {
  return apiDelete(`/modules/${id}`);
};

export const moduleService = {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
};