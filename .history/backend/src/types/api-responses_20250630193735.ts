/**
 * Tipos padronizados para respostas da API
 * Garante consistência em todas as rotas
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<{
  items: T[];
  pagination: PaginationInfo;
}> {}

export interface UnitResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
  institution_id: string;
  created_at: string;
  updated_at: string;
  institution?: {
    id: string;
    name: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface CreateUnitRequest {
  name: string;
  institution_id: string;
  description?: string;
  type?: string;
}

export interface UpdateUnitRequest {
  name?: string;
  institution_id?: string;
  description?: string;
  type?: string;
  active?: boolean;
}

export interface UnitFilters {
  search?: string;
  active?: boolean;
  institution_id?: string;
  page?: number;
  limit?: number;
}

// Helper para criar respostas padronizadas
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> => {
  const response: ApiResponse<T> = { success };
  
  if (success) {
    if (data !== undefined) response.data = data;
    if (message) response.message = message;
  } else {
    if (error) response.error = error;
    if (message) response.message = message;
  }
  
  return response;
};

// Helper para criar respostas paginadas
export const createPaginatedResponse = <T>(
  items: T[],
  pagination: PaginationInfo,
  message?: string
): PaginatedApiResponse<T> => {
  return createApiResponse(true, { items, pagination }, message);
};

// Helper para formatar unidade
export const formatUnitResponse = (unit: any): UnitResponse => ({
  id: unit.id,
  name: unit.name,
  description: unit.description || '',
  type: unit.type || 'school',
  active: !unit.deleted,
  institution_id: unit.institution_id,
  created_at: unit.date_created,
  updated_at: unit.last_updated,
  institution: unit.institution_name ? {
    id: unit.institution_id,
    name: unit.institution_name,
    created_at: unit.institution_created_at,
    updated_at: unit.institution_updated_at
  } : undefined
});