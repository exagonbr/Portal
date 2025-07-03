import { apiClient } from '@/lib/api-client';
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
    const response = await apiClient.get<PaginatedResponseDto<UserClass>>(this.baseUrl, filter as any);
    return response.data || { data: [], total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false };
  }

  async getById(id: string): Promise<UserClass> {
    const response = await apiClient.get<{ data: UserClass }>(`${this.baseUrl}/${id}`);
    if (!response.data?.data) throw new Error('User class not found');
    return response.data.data;
  }

  async getByUser(userId: string): Promise<{ data: UserClassWithDetails[] }> {
    const response = await apiClient.get<{ data: UserClassWithDetails[] }>(`${this.baseUrl}/user/${userId}`);
    return response.data || { data: [] };
  }

  async getByClass(classId: string): Promise<{ data: UserClassWithDetails[] }> {
    const response = await apiClient.get<{ data: UserClassWithDetails[] }>(`${this.baseUrl}/class/${classId}`);
    return response.data || { data: [] };
  }

  async create(data: CreateUserClassData): Promise<UserClass> {
    const response = await apiClient.post<{ data: UserClass }>(this.baseUrl, data);
    if (!response.data?.data) throw new Error('Failed to create user class');
    return response.data.data;
  }

  async update(id: string, data: UpdateUserClassData): Promise<UserClass> {
    const response = await apiClient.put<{ data: UserClass }>(`${this.baseUrl}/${id}`, data);
    if (!response.data?.data) throw new Error('Failed to update user class');
    return response.data.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async updateGrade(id: string, grade: number): Promise<UserClass> {
    const response = await apiClient.patch<{ data: UserClass }>(`${this.baseUrl}/${id}/grade`, { grade });
    if (!response.data?.data) throw new Error('Failed to update grade');
    return response.data.data;
  }

  async updateAttendance(id: string, attendance: number): Promise<UserClass> {
    const response = await apiClient.patch<{ data: UserClass }>(`${this.baseUrl}/${id}/attendance`, { attendance_percentage: attendance });
    if (!response.data?.data) throw new Error('Failed to update attendance');
    return response.data.data;
  }

  async getClassStatistics(classId: string): Promise<{
    total_students: number;
    average_grade: number;
    attendance_rate: number;
    completion_rate: number;
    top_performers: Array<{ user_id: string; user_name: string; grade: number }>;
  }> {
    const response = await apiClient.get<{ data: any }>(`${this.baseUrl}/class/${classId}/statistics`);
    return response.data?.data || {
      total_students: 0,
      average_grade: 0,
      attendance_rate: 0,
      completion_rate: 0,
      top_performers: []
    };
  }
}

export const userClassService = new UserClassService();