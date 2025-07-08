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

// Interface para filters usado na página
export interface UnitFilters {
  search?: string;
  type?: string;
  active?: boolean;
  institution_id?: string;
  page?: number;
  limit?: number;
}

// Método list para compatibilidade com a página
export const listUnits = async (filters: UnitFilters): Promise<{ items: UnitDto[], pagination: { total: number } }> => {
  const response = await apiGet<PaginatedResponse<ApiUnitResponseDto>>('/units', filters);
  return {
    items: response.items.map(mapToUnitDto),
    pagination: { total: response.pagination?.total || response.items.length }
  };
};

// Método create para compatibilidade
export const create = async (data: CreateUnitDto): Promise<UnitDto> => {
  return createUnit(data);
};

// Método update para compatibilidade
export const update = async (id: string | number, data: UpdateUnitDto): Promise<UnitDto> => {
  return updateUnit(Number(id), data);
};

// Método delete para compatibilidade
export const deleteUnitById = async (id: string | number): Promise<void> => {
  return deleteUnit(Number(id));
};

const unitService = {
  getUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  list: listUnits,
  create,
  update,
  delete: deleteUnitById,
};

export { unitService };
export default unitService;