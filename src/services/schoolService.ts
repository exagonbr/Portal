import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client';

export interface School {
  id: string;
  name: string;
  code: string;
  institution_id: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  institution?: {
    id: string;
    name: string;
  };
}

export interface CreateSchoolData {
  name: string;
  code: string;
  institution_id: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
}

export interface UpdateSchoolData {
  name?: string;
  code?: string;
  institution_id?: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive';
}

export interface SchoolFilters {
  name?: string;
  code?: string;
  type?: string;
  status?: 'active' | 'inactive';
  institution_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSchoolResponse {
  items: School[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class SchoolService {
  private baseUrl = '/schools';

  async list(filters?: SchoolFilters): Promise<PaginatedSchoolResponse> {
    try {
      const params: Record<string, string | number> = {};
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<{
        success: boolean;
        data: PaginatedSchoolResponse;
      }>(
        this.baseUrl,
        Object.keys(params).length > 0 ? params : undefined
      );
      
      if (!response.data?.success || !response.data.data) {
        throw new Error('No data received from API');
      }
      
      return response.data.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async getById(id: string): Promise<School> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: School;
      }>(`${this.baseUrl}/${id}`);
      
      if (!response.data?.success || !response.data.data) {
        throw new Error('No data received from API');
      }
      
      return response.data.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async create(data: CreateSchoolData): Promise<School> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: School;
        message: string;
      }>(this.baseUrl, data);
      
      if (!response.data?.success || !response.data.data) {
        throw new Error('No data received from API');
      }
      
      return response.data.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async update(id: string, data: UpdateSchoolData): Promise<School> {
    try {
      const response = await apiClient.put<{
        success: boolean;
        data: School;
        message: string;
      }>(`${this.baseUrl}/${id}`, data);
      
      if (!response.data?.success || !response.data.data) {
        throw new Error('No data received from API');
      }
      
      return response.data.data;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<{
        success: boolean;
        message: string;
      }>(`${this.baseUrl}/${id}`);
      
      if (!response.data?.success) {
        throw new Error('Failed to delete school');
      }
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }

  async search(query: string, filters?: SchoolFilters): Promise<School[]> {
    try {
      const params: Record<string, string | number> = { search: query };
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params[key] = value;
          }
        });
      }

      const response = await apiClient.get<{
        success: boolean;
        data: PaginatedSchoolResponse;
      }>(`${this.baseUrl}`, params);
      
      if (!response.data?.success || !response.data.data) {
        throw new Error('No data received from API');
      }
      
      return response.data.data.items;
    } catch (error) {
      throw handleApiError(error as ApiClientError);
    }
  }
}

export const schoolService = new SchoolService();