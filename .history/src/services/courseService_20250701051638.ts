import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client';
import { 
  CourseDto, 
  CreateCourseDto, 
  UpdateCourseDto,
  PaginatedResponseDto,
  CourseResponseDto 
} from '../types/api';

export interface CourseFilters {
  name?: string;
  description?: string;
  institution_id?: string;
  level?: string;
  search?: string;
  active?: boolean;
  type?: string;
}

export interface CourseListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: CourseFilters;
}

export class CourseService {
  private readonly baseEndpoint = '/courses';

  /**
   * Busca todos os cursos com paginação e filtros
   */
  async getCourses(options: CourseListOptions = {}): Promise<PaginatedResponseDto<CourseResponseDto>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
        filters = {}
      } = options;

      // Converte filtros para parâmetros de query
      const searchParams: Record<string, string | number | boolean> = {
        page,
        limit,
        sortBy,
        sortOrder
      };

      // Adiciona filtros se fornecidos
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams[key] = value;
        }
      });

      const response = await apiClient.get<PaginatedResponseDto<CourseResponseDto>>(
        this.baseEndpoint,
        searchParams
      );

      if (!response.success) {
        throw new Error(response.message || 'Falha ao buscar cursos');
      }

      return response.data!;
    } catch (error) {
      console.log('Erro ao buscar cursos:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca curso por ID
   */
  async getCourseById(id: string): Promise<CourseResponseDto> {
    try {
      const response = await apiClient.get<CourseResponseDto>(`${this.baseEndpoint}/${id}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Curso não encontrado');
      }

      return response.data;
    } catch (error) {
      console.log(`Erro ao buscar curso ${id}:`, error);
      
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error('Curso não encontrado');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cria novo curso
   */
  async createCourse(courseData: CreateCourseDto): Promise<CourseResponseDto> {
    try {
      // Validação básica
      if (!courseData.name?.trim()) {
        throw new Error('Nome do curso é obrigatório');
      }

      if (!courseData.institution_id?.trim()) {
        throw new Error('Instituição é obrigatória');
      }

      const response = await apiClient.post<CourseResponseDto>(this.baseEndpoint, courseData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao criar curso');
      }

      return response.data;
    } catch (error) {
      console.log('Erro ao criar curso:', error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 409) {
          throw new Error('Já existe um curso com este nome nesta instituição');
        }
        if (error.status === 400) {
          throw new Error(error.errors?.join(', ') || 'Dados inválidos');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Atualiza curso existente
   */
  async updateCourse(id: string, courseData: UpdateCourseDto): Promise<CourseResponseDto> {
    try {
      const response = await apiClient.put<CourseResponseDto>(`${this.baseEndpoint}/${id}`, courseData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao atualizar curso');
      }

      return response.data;
    } catch (error) {
      console.log(`Erro ao atualizar curso ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Curso não encontrado');
        }
        if (error.status === 409) {
          throw new Error('Já existe um curso com este nome nesta instituição');
        }
        if (error.status === 400) {
          throw new Error(error.errors?.join(', ') || 'Dados inválidos');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove curso
   */
  async deleteCourse(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<void>(`${this.baseEndpoint}/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao deletar curso');
      }
    } catch (error) {
      console.log(`Erro ao deletar curso ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Curso não encontrado');
        }
        if (error.status === 409) {
          throw new Error('Não é possível deletar curso que possui estudantes matriculados');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca cursos ativos (para dropdowns e seletores)
   */
  async getActiveCourses(): Promise<CourseResponseDto[]> {
    try {
      const response = await this.getCourses({
        filters: { active: true },
        limit: 100, // Busca muitos cursos ativos
        sortBy: 'name',
        sortOrder: 'asc'
      });

      return response.items;
    } catch (error) {
      console.log('Erro ao buscar cursos ativos:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca cursos por instituição
   */
  async getCoursesByInstitution(institutionId: string): Promise<CourseResponseDto[]> {
    try {
      const response = await this.getCourses({
        filters: { institution_id: institutionId },
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc'
      });

      return response.items;
    } catch (error) {
      console.log(`Erro ao buscar cursos da instituição ${institutionId}:`, error);
      return [];
    }
  }

  /**
   * Busca cursos por nome (para autocomplete)
   */
  async searchCoursesByName(name: string): Promise<CourseResponseDto[]> {
    try {
      if (!name.trim()) {
        return [];
      }

      const response = await this.getCourses({
        filters: { search: name.trim() },
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc'
      });

      return response.items;
    } catch (error) {
      console.log('Erro ao buscar cursos por nome:', error);
      return [];
    }
  }

  /**
   * Ativa/desativa curso
   */
  async toggleCourseStatus(id: string, active: boolean): Promise<CourseResponseDto> {
    try {
      const response = await apiClient.patch<CourseResponseDto>(
        `${this.baseEndpoint}/${id}/status`,
        { active }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao alterar status do curso');
      }

      return response.data;
    } catch (error) {
      console.log(`Erro ao alterar status do curso ${id}:`, error);
      
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error('Curso não encontrado');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca estudantes de um curso
   */
  async getCourseStudents(id: string, options: { page?: number; limit?: number } = {}): Promise<{
    students: any[];
    pagination: any;
  }> {
    try {
      const { page = 1, limit = 10 } = options;

      const response = await apiClient.get<{
        students: any[];
        pagination: any;
      }>(`${this.baseEndpoint}/${id}/students`, { page, limit });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar estudantes do curso');
      }

      return response.data;
    } catch (error) {
      console.log(`Erro ao buscar estudantes do curso ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca professores de um curso
   */
  async getCourseTeachers(id: string, options: { page?: number; limit?: number } = {}): Promise<{
    teachers: any[];
    pagination: any;
  }> {
    try {
      const { page = 1, limit = 10 } = options;

      const response = await apiClient.get<{
        teachers: any[];
        pagination: any;
      }>(`${this.baseEndpoint}/${id}/teachers`, { page, limit });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar professores do curso');
      }

      return response.data;
    } catch (error) {
      console.log(`Erro ao buscar professores do curso ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Matricula estudante no curso
   */
  async enrollStudent(courseId: string, studentId: string): Promise<void> {
    try {
      const response = await apiClient.post<void>(
        `${this.baseEndpoint}/${courseId}/students`,
        { student_id: studentId }
      );

      if (!response.success) {
        throw new Error(response.message || 'Falha ao matricular estudante');
      }
    } catch (error) {
      console.log(`Erro ao matricular estudante ${studentId} no curso ${courseId}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 409) {
          throw new Error('Estudante já está matriculado neste curso');
        }
        if (error.status === 404) {
          throw new Error('Curso ou estudante não encontrado');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove estudante do curso
   */
  async unenrollStudent(courseId: string, studentId: string): Promise<void> {
    try {
      const response = await apiClient.delete<void>(
        `${this.baseEndpoint}/${courseId}/students/${studentId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Falha ao remover estudante do curso');
      }
    } catch (error) {
      console.log(`Erro ao remover estudante ${studentId} do curso ${courseId}:`, error);
      
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error('Curso ou estudante não encontrado');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Adiciona professor ao curso
   */
  async addTeacher(courseId: string, teacherId: string): Promise<void> {
    try {
      const response = await apiClient.post<void>(
        `${this.baseEndpoint}/${courseId}/teachers`,
        { teacher_id: teacherId }
      );

      if (!response.success) {
        throw new Error(response.message || 'Falha ao adicionar professor');
      }
    } catch (error) {
      console.log(`Erro ao adicionar professor ${teacherId} ao curso ${courseId}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 409) {
          throw new Error('Professor já está associado a este curso');
        }
        if (error.status === 404) {
          throw new Error('Curso ou professor não encontrado');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove professor do curso
   */
  async removeTeacher(courseId: string, teacherId: string): Promise<void> {
    try {
      const response = await apiClient.delete<void>(
        `${this.baseEndpoint}/${courseId}/teachers/${teacherId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Falha ao remover professor do curso');
      }
    } catch (error) {
      console.log(`Erro ao remover professor ${teacherId} do curso ${courseId}:`, error);
      
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error('Curso ou professor não encontrado');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca estatísticas dos cursos
   */
  async getCourseStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byInstitution: Record<string, number>;
    byLevel: Record<string, number>;
    totalStudents: number;
    totalTeachers: number;
  }> {
    try {
      const response = await apiClient.get<{
        total: number;
        active: number;
        inactive: number;
        byInstitution: Record<string, number>;
        byLevel: Record<string, number>;
        totalStudents: number;
        totalTeachers: number;
      }>(`${this.baseEndpoint}/stats`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar estatísticas');
      }

      return response.data;
    } catch (error) {
      console.log('Erro ao buscar estatísticas dos cursos:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verifica se curso pode ser deletado
   */
  async canDeleteCourse(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const response = await apiClient.get<{ canDelete: boolean; reason?: string }>(
        `${this.baseEndpoint}/${id}/can-delete`
      );

      if (!response.success || !response.data) {
        return { canDelete: false, reason: 'Erro ao verificar se curso pode ser deletado' };
      }

      return response.data;
    } catch (error) {
      console.log(`Erro ao verificar se curso ${id} pode ser deletado:`, error);
      return { canDelete: false, reason: handleApiError(error) };
    }
  }

  /**
   * Duplica curso existente
   */
  async duplicateCourse(id: string, newName: string, institutionId?: string): Promise<CourseResponseDto> {
    try {
      if (!newName.trim()) {
        throw new Error('Nome para o novo curso é obrigatório');
      }

      const duplicateData: any = { name: newName.trim() };
      if (institutionId) {
        duplicateData.institution_id = institutionId;
      }

      const response = await apiClient.post<CourseResponseDto>(
        `${this.baseEndpoint}/${id}/duplicate`,
        duplicateData
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao duplicar curso');
      }

      return response.data;
    } catch (error) {
      console.log(`Erro ao duplicar curso ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Curso original não encontrado');
        }
        if (error.status === 409) {
          throw new Error('Já existe um curso com este nome nesta instituição');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Exporta cursos para CSV
   */
  async exportCourses(filters?: CourseFilters): Promise<Blob> {
    try {
      const searchParams: Record<string, string | number | boolean> = {
        format: 'csv'
      };

      // Adiciona filtros se fornecidos
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams[key] = value;
          }
        });
      }

      const response = await apiClient.get<Blob>(
        `${this.baseEndpoint}/export`,
        searchParams
      );

      if (!response.data) {
        throw new Error('Falha ao exportar cursos');
      }

      return response.data;
    } catch (error) {
      console.log('Erro ao exportar cursos:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Valida dados do curso
   */
  validateCourseData(data: CreateCourseDto | UpdateCourseDto): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Nome é obrigatório');
      } else if (data.name.length < 2) {
        errors.push('Nome deve ter pelo menos 2 caracteres');
      } else if (data.name.length > 100) {
        errors.push('Nome deve ter no máximo 100 caracteres');
      }
    }

    if ('institution_id' in data && data.institution_id !== undefined) {
      if (!data.institution_id.trim()) {
        errors.push('Instituição é obrigatória');
      }
    }

    if (data.duration !== undefined && data.duration !== null) {
      if (data.duration < 1) {
        errors.push('Duração deve ser maior que 0');
      } else if (data.duration > 9999) {
        errors.push('Duração deve ser menor que 10000 horas');
      }
    }

    return errors;
  }
}

// Instância singleton do serviço de cursos
export const courseService = new CourseService();

// Funções de conveniência para compatibilidade
export const getCourses = (options?: CourseListOptions) => courseService.getCourses(options);
export const getCourseById = (id: string) => courseService.getCourseById(id);
export const createCourse = (data: CreateCourseDto) => courseService.createCourse(data);
export const updateCourse = (id: string, data: UpdateCourseDto) => courseService.updateCourse(id, data);
export const deleteCourse = (id: string) => courseService.deleteCourse(id);
export const getActiveCourses = () => courseService.getActiveCourses();
export const getCoursesByInstitution = (institutionId: string) => courseService.getCoursesByInstitution(institutionId);
export const searchCoursesByName = (name: string) => courseService.searchCoursesByName(name);

/**
 * Busca cursos onde o usuário é professor
 */
export const getCoursesByTeacher = async (teacherId: string): Promise<CourseResponseDto[]> => {
  try {
    const response = await apiClient.get<CourseResponseDto[]>(`/teachers/${teacherId}/courses`);
    
    if (!response.success || !response.data) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.log(`Erro ao buscar cursos do professor ${teacherId}:`, error);
    return [];
  }
};

/**
 * Busca cursos onde o usuário é aluno
 */
export const getCoursesByStudent = async (studentId: string): Promise<CourseResponseDto[]> => {
  try {
    const response = await apiClient.get<CourseResponseDto[]>(`/students/${studentId}/courses`);
    
    if (!response.success || !response.data) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.log(`Erro ao buscar cursos do aluno ${studentId}:`, error);
    return [];
  }
};