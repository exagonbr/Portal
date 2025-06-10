import apiClient, { handleApiError } from './api';
import { 
  Class, 
  CreateClassData, 
  UpdateClassData, 
  ClassStats, 
  ClassFilter,
  ClassWithDetails 
} from '@/types/class';
import { PaginatedResponseDto, ClassResponseDto, ClassCreateDto, ClassUpdateDto } from '@/types/api';

interface ClassFilters {
  page?: number;
  course_id?: string;
  teacher_id?: string;
  status?: string;
  active?: boolean;
}

export const classService = {
  // Listar turmas com paginação
  async list(filter?: ClassFilter): Promise<PaginatedResponseDto<ClassResponseDto>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponseDto<ClassResponseDto>>(`/classes?${params.toString()}`);
    return response.data!;
  },

  // Buscar todas as turmas sem paginação
  async getAll(): Promise<{ data: ClassResponseDto[] }> {
    const response = await apiClient.get<{ data: ClassResponseDto[] }>('/classes/all');
    return response.data!;
  },

  // Buscar turma por ID
  async getById(id: string): Promise<ClassResponseDto> {
    try {
      const response = await apiClient.get<ClassResponseDto>(`/classes/${id}`);
      return response.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Buscar turmas por escola
  async getBySchool(schoolId: string): Promise<ClassResponseDto[]> {
    const response = await apiClient.get<ClassResponseDto[]>(`/classes/school/${schoolId}`);
    return response.data!;
  },

  // Buscar turma com detalhes
  async getWithDetails(id: string): Promise<ClassWithDetails> {
    const response = await apiClient.get<ClassWithDetails>(`/classes/${id}/details`);
    return response.data!;
  },

  // Criar nova turma
  async create(data: ClassCreateDto): Promise<ClassResponseDto> {
    try {
      const response = await apiClient.post<ClassResponseDto>('/classes', data);
      return response.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Atualizar turma
  async update(id: string, data: ClassUpdateDto): Promise<ClassResponseDto> {
    try {
      const response = await apiClient.put<ClassResponseDto>(`/classes/${id}`, data);
      return response.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Desativar turma
  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/classes/${id}`);
  },

  // Ativar turma
  async activate(id: string): Promise<ClassResponseDto> {
    const response = await apiClient.post<ClassResponseDto>(`/classes/${id}/activate`);
    return response.data!;
  },

  // Obter estatísticas da turma
  async getStats(id: string): Promise<ClassStats> {
    const response = await apiClient.get<ClassStats>(`/classes/${id}/stats`);
    return response.data!;
  },

  // Associar ciclo de ensino
  async associateEducationCycle(classId: string, cycleId: string): Promise<void> {
    await apiClient.post(`/classes/${classId}/education-cycles/${cycleId}`);
  },

  // Desassociar ciclo de ensino
  async disassociateEducationCycle(classId: string, cycleId: string): Promise<void> {
    await apiClient.delete(`/classes/${classId}/education-cycles/${cycleId}`);
  },

  async search(query: string, filters?: ClassFilters) {
    try {
      const response = await apiClient.get<{ data: ClassResponseDto[]; total: number }>('/classes/search', {
        params: {
          query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async addStudent(classId: string, studentId: string) {
    try {
      const response = await apiClient.post<ClassResponseDto>(`/classes/${classId}/students`, {
        student_id: studentId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async removeStudent(classId: string, studentId: string) {
    try {
      await apiClient.delete(`/classes/${classId}/students/${studentId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async addTeacher(classId: string, teacherId: string) {
    try {
      const response = await apiClient.post<ClassResponseDto>(`/classes/${classId}/teachers`, {
        teacher_id: teacherId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async removeTeacher(classId: string, teacherId: string) {
    try {
      await apiClient.delete(`/classes/${classId}/teachers/${teacherId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }
};