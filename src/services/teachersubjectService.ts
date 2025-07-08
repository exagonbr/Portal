import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api-client' from './base-api-service';

export interface TeacherSubject {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherSubjectDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateTeacherSubjectDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface TeacherSubjectResponse {
  data: TeacherSubject[];
  total: number;
}

class TeacherSubjectService extends BaseApiService<TeacherSubject> {
  constructor() {
    super('/api/teacher-subject');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<TeacherSubjectResponse> {
    const response = await apiClient.post<any>(`${this.basePath}?page=${page}&limit=${limit}`, { teacherId });
    return response.data;
  }
}

export const teacherSubjectService = new TeacherSubjectService();