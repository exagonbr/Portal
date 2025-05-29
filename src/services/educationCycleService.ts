import api from './api';
import { 
  EducationCycle, 
  CreateEducationCycleData, 
  UpdateEducationCycleData, 
  EducationCycleFilter,
  EducationCycleWithClasses 
} from '@/types/educationCycle';
import { PaginatedResponseDto } from '@/types/common';

class EducationCycleService {
  private baseUrl = '/education-cycles';

  async list(filter?: EducationCycleFilter): Promise<PaginatedResponseDto<EducationCycle>> {
    const response = await api.get<PaginatedResponseDto<EducationCycle>>(this.baseUrl, { params: filter });
    return response.data;
  }

  async getAll(): Promise<{ data: EducationCycle[] }> {
    const response = await api.get<{ data: EducationCycle[] }>(`${this.baseUrl}/all`);
    return response.data;
  }

  async getById(id: string): Promise<EducationCycle> {
    const response = await api.get<{ data: EducationCycle }>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async getWithClasses(id: string): Promise<EducationCycleWithClasses> {
    const response = await api.get<{ data: EducationCycleWithClasses }>(`${this.baseUrl}/${id}/with-classes`);
    return response.data.data;
  }

  async create(data: CreateEducationCycleData): Promise<EducationCycle> {
    const response = await api.post<{ data: EducationCycle }>(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: string, data: UpdateEducationCycleData): Promise<EducationCycle> {
    const response = await api.put<{ data: EducationCycle }>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async associateClass(cycleId: string, classId: string): Promise<void> {
    await api.post(`${this.baseUrl}/${cycleId}/classes/${classId}`);
  }

  async disassociateClass(cycleId: string, classId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${cycleId}/classes/${classId}`);
  }

  async getStatistics(id: string): Promise<{
    total_students: number;
    total_teachers: number;
    total_classes: number;
    average_grade: number;
    attendance_rate: number;
  }> {
    const response = await api.get<{ data: any }>(`${this.baseUrl}/${id}/statistics`);
    return response.data.data;
  }
}

export const educationCycleService = new EducationCycleService();