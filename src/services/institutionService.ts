import { apiClient, handleApiError, ApiClientError } from './apiClient';
import { 
  InstitutionResponseDto, 
  InstitutionCreateDto, 
  InstitutionUpdateDto,
  PaginatedResponseDto 
} from '../types/api';

export interface InstitutionFilters {
  name?: string;
  description?: string;
  active?: boolean;
  search?: string;
  city?: string;
  state?: string;
}

export interface InstitutionListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: InstitutionFilters;
}

export class InstitutionService {
  private readonly baseEndpoint = '/institutions';

  /**
   * Busca todas as instituições com paginação e filtros
   */
  async getInstitutions(options: InstitutionListOptions = {}): Promise<PaginatedResponseDto<InstitutionResponseDto>> {
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

      const response = await apiClient.get<PaginatedResponseDto<InstitutionResponseDto>>(
        this.baseEndpoint,
        searchParams
      );

      if (!response.success) {
        throw new Error(response.message || 'Falha ao buscar instituições');
      }

      return response.data!;
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca instituição por ID
   */
  async getInstitutionById(id: string): Promise<InstitutionResponseDto> {
    try {
      const response = await apiClient.get<InstitutionResponseDto>(`${this.baseEndpoint}/${id}`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Instituição não encontrada');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar instituição ${id}:`, error);
      
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error('Instituição não encontrada');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cria nova instituição
   */
  async createInstitution(institutionData: InstitutionCreateDto): Promise<InstitutionResponseDto> {
    try {
      // Validação básica
      if (!institutionData.name?.trim()) {
        throw new Error('Nome da instituição é obrigatório');
      }

      const response = await apiClient.post<InstitutionResponseDto>(this.baseEndpoint, institutionData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao criar instituição');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao criar instituição:', error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 409) {
          throw new Error('Já existe uma instituição com este nome');
        }
        if (error.status === 400) {
          throw new Error(error.errors?.join(', ') || 'Dados inválidos');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Atualiza instituição existente
   */
  async updateInstitution(id: string, institutionData: InstitutionUpdateDto): Promise<InstitutionResponseDto> {
    try {
      const response = await apiClient.put<InstitutionResponseDto>(`${this.baseEndpoint}/${id}`, institutionData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao atualizar instituição');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar instituição ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Instituição não encontrada');
        }
        if (error.status === 409) {
          throw new Error('Já existe uma instituição com este nome');
        }
        if (error.status === 400) {
          throw new Error(error.errors?.join(', ') || 'Dados inválidos');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove instituição
   */
  async deleteInstitution(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<void>(`${this.baseEndpoint}/${id}`);

      if (!response.success) {
        throw new Error(response.message || 'Falha ao deletar instituição');
      }
    } catch (error) {
      console.error(`Erro ao deletar instituição ${id}:`, error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 404) {
          throw new Error('Instituição não encontrada');
        }
        if (error.status === 409) {
          throw new Error('Não é possível deletar instituição que possui usuários ou cursos');
        }
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca instituições ativas (para dropdowns e seletores)
   */
  async getActiveInstitutions(): Promise<InstitutionResponseDto[]> {
    try {
      const response = await this.getInstitutions({
        filters: { active: true },
        limit: 100, // Busca muitas instituições ativas
        sortBy: 'name',
        sortOrder: 'asc'
      });

      return response.items;
    } catch (error) {
      console.error('Erro ao buscar instituições ativas:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca instituições por nome (para autocomplete)
   */
  async searchInstitutionsByName(name: string): Promise<InstitutionResponseDto[]> {
    try {
      if (!name.trim()) {
        return [];
      }

      const response = await this.getInstitutions({
        filters: { search: name.trim() },
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc'
      });

      return response.items;
    } catch (error) {
      console.error('Erro ao buscar instituições por nome:', error);
      return [];
    }
  }

  /**
   * Ativa/desativa instituição
   */
  async toggleInstitutionStatus(id: string, active: boolean): Promise<InstitutionResponseDto> {
    try {
      const response = await apiClient.patch<InstitutionResponseDto>(
        `${this.baseEndpoint}/${id}/status`,
        { active }
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao alterar status da instituição');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao alterar status da instituição ${id}:`, error);
      
      if (error instanceof ApiClientError && error.status === 404) {
        throw new Error('Instituição não encontrada');
      }
      
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca estatísticas das instituições
   */
  async getInstitutionStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    usersCount: Record<string, number>;
    coursesCount: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get<{
        total: number;
        active: number;
        inactive: number;
        usersCount: Record<string, number>;
        coursesCount: Record<string, number>;
      }>(`${this.baseEndpoint}/stats`);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar estatísticas');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas das instituições:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verifica se instituição pode ser deletada
   */
  async canDeleteInstitution(id: string): Promise<{ canDelete: boolean; reason?: string }> {
    try {
      const response = await apiClient.get<{ canDelete: boolean; reason?: string }>(
        `${this.baseEndpoint}/${id}/can-delete`
      );

      if (!response.success || !response.data) {
        return { canDelete: false, reason: 'Erro ao verificar se instituição pode ser deletada' };
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao verificar se instituição ${id} pode ser deletada:`, error);
      return { canDelete: false, reason: handleApiError(error) };
    }
  }

  /**
   * Busca usuários de uma instituição
   */
  async getInstitutionUsers(id: string, options: { page?: number; limit?: number } = {}): Promise<{
    users: any[];
    pagination: any;
  }> {
    try {
      const { page = 1, limit = 10 } = options;

      const response = await apiClient.get<{
        users: any[];
        pagination: any;
      }>(`${this.baseEndpoint}/${id}/users`, { page, limit });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar usuários da instituição');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar usuários da instituição ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca cursos de uma instituição
   */
  async getInstitutionCourses(id: string, options: { page?: number; limit?: number } = {}): Promise<{
    courses: any[];
    pagination: any;
  }> {
    try {
      const { page = 1, limit = 10 } = options;

      const response = await apiClient.get<{
        courses: any[];
        pagination: any;
      }>(`${this.baseEndpoint}/${id}/courses`, { page, limit });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao buscar cursos da instituição');
      }

      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar cursos da instituição ${id}:`, error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Exporta instituições para CSV
   */
  async exportInstitutions(filters?: InstitutionFilters): Promise<Blob> {
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
        throw new Error('Falha ao exportar instituições');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao exportar instituições:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Importa instituições de arquivo CSV
   */
  async importInstitutions(file: File): Promise<{
    success: number;
    errors: Array<{ line: number; error: string }>;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{
        success: number;
        errors: Array<{ line: number; error: string }>;
      }>(`${this.baseEndpoint}/import`, formData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao importar instituições');
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao importar instituições:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Busca instituições por localização
   */
  async getInstitutionsByLocation(city?: string, state?: string): Promise<InstitutionResponseDto[]> {
    try {
      const filters: InstitutionFilters = {};
      if (city) filters.city = city;
      if (state) filters.state = state;

      const response = await this.getInstitutions({
        filters,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'asc'
      });

      return response.items;
    } catch (error) {
      console.error('Erro ao buscar instituições por localização:', error);
      return [];
    }
  }

  /**
   * Valida dados da instituição
   */
  validateInstitutionData(data: InstitutionCreateDto | InstitutionUpdateDto): string[] {
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

    if (data.email && data.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Email inválido');
      }
    }

    if (data.phone && data.phone.trim()) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(data.phone)) {
        errors.push('Telefone deve estar no formato (XX) XXXXX-XXXX');
      }
    }

    return errors;
  }

  /**
   * Método list para compatibilidade com outros serviços
   */
  async list(options?: InstitutionListOptions): Promise<PaginatedResponseDto<InstitutionResponseDto>> {
    return this.getInstitutions(options);
  }

  /**
   * Método getAll para compatibilidade com outros serviços
   */
  async getAll(): Promise<{ data: InstitutionResponseDto[] }> {
    const response = await this.getInstitutions({ limit: 1000 });
    return { data: response.items };
  }

  /**
   * Método create para compatibilidade com outros serviços
   */
  async create(data: InstitutionCreateDto): Promise<InstitutionResponseDto> {
    return this.createInstitution(data);
  }

  /**
   * Método update para compatibilidade com outros serviços
   */
  async update(id: string, data: InstitutionUpdateDto): Promise<InstitutionResponseDto> {
    return this.updateInstitution(id, data);
  }
}

// Instância singleton do serviço de instituições
export const institutionService = new InstitutionService();

// Funções de conveniência para compatibilidade
export const getInstitutions = (options?: InstitutionListOptions) => institutionService.getInstitutions(options);
export const getInstitutionById = (id: string) => institutionService.getInstitutionById(id);
export const createInstitution = (data: InstitutionCreateDto) => institutionService.createInstitution(data);
export const updateInstitution = (id: string, data: InstitutionUpdateDto) => institutionService.updateInstitution(id, data);
export const deleteInstitution = (id: string) => institutionService.deleteInstitution(id);
export const getActiveInstitutions = () => institutionService.getActiveInstitutions();
export const searchInstitutionsByName = (name: string) => institutionService.searchInstitutionsByName(name);