import {
  UnitDto,
  CreateUnitDto,
  UpdateUnitDto,
  UnitFilter,
} from '@/types/unit';
import {
  PaginatedResponse,
  UnitResponseDto as ApiUnitResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToUnitDto = (data: ApiUnitResponseDto): UnitDto => ({
  id: String(data.id),
  name: data.name,
  institution_id: String(data.institution_id),
  institution_name: data.institution_name,
  deleted: data.deleted,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
});

export const getUnits = async (params: UnitFilter): Promise<PaginatedResponse<UnitDto>> => {
  const response = await apiGet<PaginatedResponse<ApiUnitResponseDto>>('/units', params);
  return {
    ...response,
    items: response.items.map(mapToUnitDto),
  };
};

export const getUnitById = async (id: number): Promise<UnitDto> => {
  const response = await apiGet<ApiUnitResponseDto>(`/units/${id}`);
  return mapToUnitDto(response);
};

export const createUnit = async (data: CreateUnitDto): Promise<UnitDto> => {
  const response = await apiPost<ApiUnitResponseDto>('/units', data);
  return mapToUnitDto(response);
};

export const updateUnit = async (id: number, data: UpdateUnitDto): Promise<UnitDto> => {
  const response = await apiPut<ApiUnitResponseDto>(`/units/${id}`, data);
  return mapToUnitDto(response);
};

export const deleteUnit = async (id: number): Promise<void> => {
  return apiDelete(`/units/${id}`);
};

export const unitService = {
  getUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
};