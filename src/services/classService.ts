import { apiClient } from './apiClient';
import { 
  Class, 
  CreateClassData, 
  UpdateClassData, 
  ClassStats, 
  ClassFilter,
  ClassWithDetails 
} from '@/types/class';
import { PaginatedResponseDto } from '@/types/api';

export const classService = {
  // Listar turmas com paginação
  async list(filter?: ClassFilter): Promise<PaginatedResponseDto<Class>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await apiClient.get<PaginatedResponseDto<Class>>(`/classes?${params.toString()}`);
    return response.data!;
  },

  // Buscar todas as turmas sem paginação
  async getAll(): Promise<{ data: Class[] }> {
    const response = await apiClient.get<{ data: Class[] }>('/classes/all');
    return response.data!;
  },

  // Buscar turma por ID
  async getById(id: string): Promise<Class> {
    const response = await apiClient.get<Class>(`/classes/${id}`);
    return response.data!;
  },

  // Buscar turmas por escola
  async getBySchool(schoolId: string): Promise<Class[]> {
    const response = await apiClient.get<Class[]>(`/classes/school/${schoolId}`);
    return response.data!;
  },

  // Buscar turma com detalhes
  async getWithDetails(id: string): Promise<ClassWithDetails> {
    const response = await apiClient.get<ClassWithDetails>(`/classes/${id}/details`);
    return response.data!;
  },

  // Criar nova turma
  async create(data: CreateClassData): Promise<Class> {
    const response = await apiClient.post<Class>('/classes', data);
    return response.data!;
  },

  // Atualizar turma
  async update(id: string, data: UpdateClassData): Promise<Class> {
    const response = await apiClient.put<Class>(`/classes/${id}`, data);
    return response.data!;
  },

  // Desativar turma
  async deactivate(id: string): Promise<void> {
    await apiClient.delete(`/classes/${id}`);
  },

  // Ativar turma
  async activate(id: string): Promise<Class> {
    const response = await apiClient.post<Class>(`/classes/${id}/activate`);
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
  }
};