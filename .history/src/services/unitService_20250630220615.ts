import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client';

export interface Unit {
  id: string;
  name: string;
  version?: number;
  deleted?: boolean;
  institution_id: string;
  institution_name?: string;
  date_created?: string;
  last_updated?: string;
  // Campos adicionais para compatibilidade com frontend
  description?: string;
  type?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  institution?: {
    id: string;
    name: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface CreateUnitData {
  name: string;
  institution_id: string;
  description?: string;
  type?: string;
}

export interface UpdateUnitData {
  name?: string;
  institution_id?: string;
  description?: string;
  type?: string;
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

      const response = await apiClient.get<PaginatedUnitResponse>(
        this.baseUrl,
        Object.keys(params).length > 0 ? params : undefined
      );
      
      console.log('✅ UnitService.list - Resposta recebida', response);
      console.log('🔍 UnitService.list - Estrutura da resposta:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataType: typeof response.data,
        success: response.success,
        fullResponse: JSON.stringify(response, null, 2)
      });
      
      // Verificar se a resposta foi bem-sucedida
      if (!response.success) {
        console.error('❌ UnitService.list - API retornou erro:', response.message);
        throw new Error(response.message || 'API returned error');
      }

      // Verificar se os dados existem e têm a estrutura esperada
      if (!response.data) {
        console.error('❌ UnitService.list - Dados não encontrados na resposta');
        throw new Error('No data returned from API');
      }

      // Verificar se a estrutura está correta (items e pagination)
      if (!response.data.items || !Array.isArray(response.data.items)) {
        console.error('❌ UnitService.list - Estrutura de dados inválida:', {
          hasItems: !!response.data.items,
          itemsType: typeof response.data.items,
          isArray: Array.isArray(response.data.items)
        });
        throw new Error('Invalid data structure from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ UnitService.list - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async getById(id: string): Promise<Unit> {
    try {
      console.log('🔄 UnitService.getById - Buscando unidade', id);
      
      const response = await apiClient.get<Unit>(`${this.baseUrl}/${id}`);
      
      console.log('✅ UnitService.getById - Resposta recebida', response);
      
      if (!response.success) {
        throw new Error(response.message || 'API returned error');
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ UnitService.getById - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async create(data: CreateUnitData): Promise<Unit> {
    try {
      console.log('🔄 UnitService.create - Criando unidade', data);
      
      const response = await apiClient.post<Unit>(this.baseUrl, data);
      
      console.log('✅ UnitService.create - Resposta recebida', response);
      
      if (!response.success) {
        throw new Error(response.message || 'API returned error');
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ UnitService.create - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async update(id: string, data: UpdateUnitData): Promise<Unit> {
    try {
      console.log('🔄 UnitService.update - Atualizando unidade', id, data);
      
      const response = await apiClient.put<Unit>(`${this.baseUrl}/${id}`, data);
      
      console.log('✅ UnitService.update - Resposta recebida', response);
      
      if (!response.success) {
        throw new Error(response.message || 'API returned error');
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ UnitService.update - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      console.log('🔄 UnitService.delete - Excluindo unidade', id);
      
      const response = await apiClient.delete<void>(`${this.baseUrl}/${id}`);
      
      console.log('✅ UnitService.delete - Resposta recebida', response);
      
      if (!response.success) {
        throw new Error(response.message || 'API returned error');
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

      const response = await apiClient.get<Unit[]>(`${this.baseUrl}/search`, params);
      
      console.log('✅ UnitService.search - Resposta recebida', response);
      
      if (!response.success) {
        throw new Error(response.message || 'API returned error');
      }

      if (!response.data) {
        throw new Error('No data returned from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ UnitService.search - Erro:', error);
      throw handleApiError(error as ApiClientError);
    }
  }
}

export const unitService = new UnitService(); 