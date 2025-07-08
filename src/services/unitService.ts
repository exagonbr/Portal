import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export interface UnitDto {
  id: string;
  name: string;
  type?: string;
  description?: string;
  institution_id: string;
  institution_name?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnitCreateDto {
  name: string;
  type?: string;
  description?: string;
  institution_id: string;
  active?: boolean;
}

export interface UnitUpdateDto extends Partial<UnitCreateDto> {}

export interface UnitFilters {
  search?: string;
  type?: string;
  active?: boolean;
  institution_id?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUnits {
  items: UnitDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const getUnits = async (filters: UnitFilters = {}): Promise<PaginatedUnits> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await apiGet<any>(`/units?${params.toString()}`);
  
  return {
    items: response.items || response.data || [],
    pagination: {
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.limit || 10))
    }
  };
};

const getUnitById = async (id: string): Promise<UnitDto> => {
  const response = await apiGet<any>(`/units/${id}`);
  return response.data || response;
};

const createUnit = async (data: UnitCreateDto): Promise<UnitDto> => {
  const response = await apiPost<any>('/units', data);
  return response.data || response;
};

const updateUnit = async (id: string, data: UnitUpdateDto): Promise<UnitDto> => {
  const response = await apiPut<any>(`/units/${id}`, data);
  return response.data || response;
};

const deleteUnit = async (id: string): Promise<void> => {
  await apiDelete(`/units/${id}`);
};

const unitService = {
  // Métodos principais
  getAll: getUnits,
  getById: getUnitById,
  create: createUnit,
  update: updateUnit,
  delete: deleteUnit,
  
  // Aliases para compatibilidade
  list: getUnits,
  getUnits,
  createUnit,
  updateUnit,
  deleteUnit
};

export { unitService };
export default unitService;