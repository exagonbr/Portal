import { apiClient } from '@/lib/api-client';
import { 
  EducationCycle, 
  CreateEducationCycleData, 
  UpdateEducationCycleData, 
  EducationCycleFilter,
  EducationCycleWithClasses 
} from '@/types/educationCycle';
import { PaginatedResponseDto } from '@/types/common';

export class EducationCycleService {
  private baseUrl = '/api/education-cycles';

  async list(filter?: EducationCycleFilter): Promise<PaginatedResponseDto<EducationCycle>> {
    const response = await apiClient.get<PaginatedResponseDto<EducationCycle>>(this.baseUrl, filter as any);
    return response.data || { data: [], total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false };
  }

  async getAll(): Promise<{ data: EducationCycle[] }> {
    const response = await apiClient.get<{ data: EducationCycle[] }>(`${this.baseUrl}/all`);
    return response.data || { data: [] };
  }

  async getById(id: string): Promise<EducationCycle> {
    const response = await apiClient.get<{ data: EducationCycle }>(`${this.baseUrl}/${id}`);
    if (!response.data?.data) throw new Error('Education cycle not found');
    return response.data.data;
  }

  async getWithClasses(id: string): Promise<EducationCycleWithClasses> {
    const response = await apiClient.get<{ data: EducationCycleWithClasses }>(`${this.baseUrl}/${id}/with-classes`);
    if (!response.data?.data) throw new Error('Education cycle with classes not found');
    return response.data.data;
  }

  async create(data: CreateEducationCycleData): Promise<EducationCycle> {
    const response = await apiClient.post<{ data: EducationCycle }>(this.baseUrl, data);
    if (!response.data?.data) throw new Error('Failed to create education cycle');
    return response.data.data;
  }

  async update(id: string, data: UpdateEducationCycleData): Promise<EducationCycle> {
    const response = await apiClient.put<{ data: EducationCycle }>(`${this.baseUrl}/${id}`, data);
    if (!response.data?.data) throw new Error('Failed to update education cycle');
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async associateClass(cycleId: string, classId: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${cycleId}/classes/${classId}`);
  }

  async disassociateClass(cycleId: string, classId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${cycleId}/classes/${classId}`);
  }

  async getStatistics(id: string): Promise<{
    total_students: number;
    total_teachers: number;
    total_classes: number;
    average_grade: number;
    attendance_rate: number;
  }> {
    const response = await apiClient.get<{ data: any }>(`${this.baseUrl}/${id}/statistics`);
    return response.data?.data || {
      total_students: 0,
      total_teachers: 0,
      total_classes: 0,
      average_grade: 0,
      attendance_rate: 0
    };
  }
}

export const educationCycleService = new EducationCycleService();