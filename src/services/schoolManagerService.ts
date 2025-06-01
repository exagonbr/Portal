import api from './api';
import { 
  SchoolManager, 
  CreateSchoolManagerData, 
  UpdateSchoolManagerData, 
  SchoolManagerFilter,
  SchoolManagerWithDetails 
} from '@/types/schoolManager';
import { PaginatedResponseDto } from '@/types/common';

export class SchoolManagerService {
  private baseUrl = '/api/school-managers';

  async list(filter?: SchoolManagerFilter): Promise<PaginatedResponseDto<SchoolManager>> {
    const response = await api.get<PaginatedResponseDto<SchoolManager>>(this.baseUrl, { params: filter });
    return response.data;
  }

  async getById(id: string): Promise<SchoolManager> {
    const response = await api.get<{ data: SchoolManager }>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async getBySchool(schoolId: string): Promise<{ data: SchoolManagerWithDetails[] }> {
    const response = await api.get<{ data: SchoolManagerWithDetails[] }>(`${this.baseUrl}/school/${schoolId}`);
    return response.data;
  }

  async getByUser(userId: string): Promise<{ data: SchoolManagerWithDetails[] }> {
    const response = await api.get<{ data: SchoolManagerWithDetails[] }>(`${this.baseUrl}/user/${userId}`);
    return response.data;
  }

  async create(data: CreateSchoolManagerData): Promise<SchoolManager> {
    const response = await api.post<{ data: SchoolManager }>(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: string, data: UpdateSchoolManagerData): Promise<SchoolManager> {
    const response = await api.put<{ data: SchoolManager }>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async activate(id: string): Promise<SchoolManager> {
    const response = await api.patch<{ data: SchoolManager }>(`${this.baseUrl}/${id}/activate`);
    return response.data.data;
  }

  async deactivate(id: string): Promise<SchoolManager> {
    const response = await api.patch<{ data: SchoolManager }>(`${this.baseUrl}/${id}/deactivate`);
    return response.data.data;
  }

  async getActiveManagers(schoolId: string): Promise<{ data: SchoolManagerWithDetails[] }> {
    const response = await api.get<{ data: SchoolManagerWithDetails[] }>(`${this.baseUrl}/school/${schoolId}/active`);
    return response.data;
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
    const response = await api.get<{ data: any }>(`${this.baseUrl}/user/${userId}/history`);
    return response.data;
  }
}

export const schoolManagerService = new SchoolManagerService();