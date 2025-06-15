import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client';
import { 
  UnitResponseDto, 
  UnitCreateDto, 
  UnitUpdateDto,
  PaginatedResponseDto 
} from '../types/api';

export interface UnitFilters {
  name?: string;
  description?: string;
  active?: boolean;
  search?: string;
  institution_id?: string;
  type?: string;
}

class UnitService {
  private baseUrl = '/units';

  async list(filters?: UnitFilters): Promise<PaginatedResponseDto<UnitResponseDto>> {
    try {
      // Filter out undefined values and ensure all values are of correct type
      const params: Record<string, string | number | boolean> = {};
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<PaginatedResponseDto<UnitResponseDto>>(
        this.baseUrl,
        Object.keys(params).length > 0 ? params : undefined
      );
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async getById(id: string): Promise<UnitResponseDto> {
    try {
      const response = await apiClient.get<UnitResponseDto>(`${this.baseUrl}/${id}`);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async create(data: UnitCreateDto): Promise<UnitResponseDto> {
    try {
      const response = await apiClient.post<UnitResponseDto>(this.baseUrl, data);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async update(id: string, data: UnitUpdateDto): Promise<UnitResponseDto> {
    try {
      const response = await apiClient.put<UnitResponseDto>(`${this.baseUrl}/${id}`, data);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async search(query: string, filters?: UnitFilters): Promise<UnitResponseDto[]> {
    try {
      // Filter out undefined values and ensure all values are of correct type
      const params: Record<string, string | number | boolean> = { q: query };
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<UnitResponseDto[]>(`${this.baseUrl}/search`, params);
      
      if (!response.data) {
        throw new Error('No data received from API');
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }
}

export const unitService = new UnitService(); 