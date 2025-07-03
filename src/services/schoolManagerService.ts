import { apiClient } from '@/lib/api-client';
import { 
  SchoolManager, 
  CreateSchoolManagerData, 
  UpdateSchoolManagerData, 
  SchoolManagerFilter,
  SchoolManagerWithDetails 
} from '@/types/schoolManager';
import { PaginatedResponseDto } from '@/types/common';

class SchoolManagerService {
  private baseUrl = '/school-managers';

  async list(filter?: SchoolManagerFilter): Promise<PaginatedResponseDto<SchoolManager>> {
    const response = await apiClient.get<PaginatedResponseDto<SchoolManager>>(this.baseUrl, filter as any);
    return response.data || { data: [], total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false };
  }

  async getById(id: string): Promise<SchoolManager> {
    const response = await apiClient.get<{ data: SchoolManager }>(`${this.baseUrl}/${id}`);
    if (!response.data?.data) throw new Error('School manager not found');
    return response.data.data;
  }

  async getBySchool(schoolId: string): Promise<{ data: SchoolManagerWithDetails[] }> {
    const response = await apiClient.get<{ data: SchoolManagerWithDetails[] }>(`${this.baseUrl}/school/${schoolId}`);
    return response.data || { data: [] };
  }

  async getByUser(userId: string): Promise<{ data: SchoolManagerWithDetails[] }> {
    const response = await apiClient.get<{ data: SchoolManagerWithDetails[] }>(`${this.baseUrl}/user/${userId}`);
    return response.data || { data: [] };
  }

  async create(data: CreateSchoolManagerData): Promise<SchoolManager> {
    const response = await apiClient.post<{ data: SchoolManager }>(this.baseUrl, data);
    if (!response.data?.data) throw new Error('Failed to create school manager');
    return response.data.data;
  }

  async update(id: string, data: UpdateSchoolManagerData): Promise<SchoolManager> {
    const response = await apiClient.put<{ data: SchoolManager }>(`${this.baseUrl}/${id}`, data);
    if (!response.data?.data) throw new Error('Failed to update school manager');
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async activate(id: string): Promise<SchoolManager> {
    const response = await apiClient.patch<{ data: SchoolManager }>(`${this.baseUrl}/${id}/activate`);
    if (!response.data?.data) throw new Error('Failed to activate school manager');
    return response.data.data;
  }

  async deactivate(id: string): Promise<SchoolManager> {
    const response = await apiClient.patch<{ data: SchoolManager }>(`${this.baseUrl}/${id}/deactivate`);
    if (!response.data?.data) throw new Error('Failed to deactivate school manager');
    return response.data.data;
  }

  async getActiveManagers(schoolId: string): Promise<{ data: SchoolManagerWithDetails[] }> {
    const response = await apiClient.get<{ data: SchoolManagerWithDetails[] }>(`${this.baseUrl}/school/${schoolId}/active`);
    return response.data || { data: [] };
  }

  async getManagerHistory(userId: string): Promise<{
    data: Array<{
      school_id: string;
      school_name: string;
      position: string;
      start_date: Date;
      end_date?: Date;
      is_active: boolean;
    }>;
  }> {
    const response = await apiClient.get<{ data: any }>(`${this.baseUrl}/user/${userId}/history`);
    return response.data || { data: [] };
  }
}

export const schoolManagerService = new SchoolManagerService();