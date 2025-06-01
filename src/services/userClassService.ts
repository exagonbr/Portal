import api from './api';
import { 
  UserClass, 
  CreateUserClassData, 
  UpdateUserClassData, 
  UserClassFilter,
  UserClassWithDetails 
} from '@/types/userClass';
import { PaginatedResponseDto } from '@/types/common';

export class UserClassService {
  private baseUrl = '/api/user-classes';

  async list(filter?: UserClassFilter): Promise<PaginatedResponseDto<UserClass>> {
    const response = await api.get<PaginatedResponseDto<UserClass>>(this.baseUrl, { params: filter });
    return response.data;
  }

  async getById(id: string): Promise<UserClass> {
    const response = await api.get<{ data: UserClass }>(`${this.baseUrl}/${id}`);
    return response.data.data;
  }

  async getByUser(userId: string): Promise<{ data: UserClassWithDetails[] }> {
    const response = await api.get<{ data: UserClassWithDetails[] }>(`${this.baseUrl}/user/${userId}`);
    return response.data;
  }

  async getByClass(classId: string): Promise<{ data: UserClassWithDetails[] }> {
    const response = await api.get<{ data: UserClassWithDetails[] }>(`${this.baseUrl}/class/${classId}`);
    return response.data;
  }

  async create(data: CreateUserClassData): Promise<UserClass> {
    const response = await api.post<{ data: UserClass }>(this.baseUrl, data);
    return response.data.data;
  }

  async update(id: string, data: UpdateUserClassData): Promise<UserClass> {
    const response = await api.put<{ data: UserClass }>(`${this.baseUrl}/${id}`, data);
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }

  async updateGrade(id: string, grade: number): Promise<UserClass> {
    const response = await api.patch<{ data: UserClass }>(`${this.baseUrl}/${id}/grade`, { grade });
    return response.data.data;
  }

  async updateAttendance(id: string, attendance: number): Promise<UserClass> {
    const response = await api.patch<{ data: UserClass }>(`${this.baseUrl}/${id}/attendance`, { attendance_percentage: attendance });
    return response.data.data;
  }

  async getStatistics(classId: string): Promise<{
    total_students: number;
    total_teachers: number;
    average_grade: number;
    average_attendance: number;
    by_role: Record<string, number>;
  }> {
    const response = await api.get<{ data: any }>(`${this.baseUrl}/class/${classId}/statistics`);
    return response.data.data;
  }
}

export const userClassService = new UserClassService();