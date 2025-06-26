import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client';

export interface Unit {
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
    created_at: string;
    updated_at: string;
  };
}

export interface CreateUnitData {
  name: string;
  institution_id: string;
}

export interface UpdateUnitData {
  name?: string;
  institution_id?: string;
  active?: boolean;
}

export interface UnitFilters {
  name?: string;
  search?: string;
  type?: string;
  active?: boolean;
  institution_id?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUnitResponse {
  items: Unit[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class UnitService {
  private baseUrl = '/units';

  async list(filters?: UnitFilters): Promise<PaginatedUnitResponse> {
    try {
      console.log('🔄 UnitService.list - Iniciando busca de unidades', filters);
      
      const params: Record<string, string | number | boolean> = {};
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params[key] = value;
          }
        });
      }

      console.log('📡 UnitService.list - Fazendo requisição para API', { url: this.baseUrl, params });

      const response = await apiClient.get<{
        success: boolean;
        data: PaginatedUnitResponse;
      }>(
        this.baseUrl,
        Object.keys(params).length > 0 ? params : undefined
      );
      
      console.log('✅ UnitService.list - Resposta recebida', response);
      
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from API');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('❌ UnitService.list - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async getById(id: string): Promise<Unit> {
    try {
      console.log('🔄 UnitService.getById - Buscando unidade', id);
      
      const response = await apiClient.get<{
        success: boolean;
        data: Unit;
      }>(`${this.baseUrl}/${id}`);
      
      console.log('✅ UnitService.getById - Resposta recebida', response);
      
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from API');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('❌ UnitService.getById - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async create(data: CreateUnitData): Promise<Unit> {
    try {
      console.log('🔄 UnitService.create - Criando unidade', data);
      
      const response = await apiClient.post<{
        success: boolean;
        data: Unit;
        message?: string;
      }>(this.baseUrl, data);
      
      console.log('✅ UnitService.create - Resposta recebida', response);
      
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from API');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('❌ UnitService.create - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async update(id: string, data: UpdateUnitData): Promise<Unit> {
    try {
      console.log('🔄 UnitService.update - Atualizando unidade', id, data);
      
      const response = await apiClient.put<{
        success: boolean;
        data: Unit;
        message?: string;
      }>(`${this.baseUrl}/${id}`, data);
      
      console.log('✅ UnitService.update - Resposta recebida', response);
      
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from API');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('❌ UnitService.update - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.log('🔄 UnitService.delete - Excluindo unidade', id);
      
      const response = await apiClient.delete<{
        success: boolean;
        message?: string;
      }>(`${this.baseUrl}/${id}`);
      
      console.log('✅ UnitService.delete - Resposta recebida', response);
      
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('❌ UnitService.delete - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async search(query: string, filters?: UnitFilters): Promise<Unit[]> {
    try {
      console.log('🔄 UnitService.search - Buscando unidades', query, filters);
      
      const params: Record<string, string | number | boolean> = { search: query };
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<{
        success: boolean;
        data: Unit[];
      }>(`${this.baseUrl}/search`, params);
      
      console.log('✅ UnitService.search - Resposta recebida', response);
      
      if (!response.data || !response.data.success) {
        throw new Error('Invalid response format from API');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('❌ UnitService.search - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }
}

export const unitService = new UnitService(); 