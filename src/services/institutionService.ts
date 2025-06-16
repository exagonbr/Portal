import { API_BASE_URL } from '../config/constants';
import { 
  Institution, 
  InstitutionDto,
  CreateInstitutionDto, 
  UpdateInstitutionDto,
  InstitutionFilter,
  InstitutionType,
  INSTITUTION_TYPE_LABELS
} from '../types/institution';
import { 
  ApiResponse, 
  PaginatedResponse,
  formatPhone,
  isValidEmail,
  isValidPhone
} from '../types/common';
import { 
  validateInstitutionData,
  validateApiResponse,
  migrateContactFields,
  ensureLegacyCompatibility
} from '../utils/validation';

// Re-exportar tipos para compatibilidade
export { 
  Institution, 
  InstitutionType, 
  INSTITUTION_TYPE_LABELS,
  type InstitutionFilter as InstitutionFilters,
  type InstitutionFilter as InstitutionListOptions,
  type InstitutionFilter as InstitutionQueryParams
};

const API_BASE = `${API_BASE_URL}/institutions`;

export class InstitutionService {
  // Listar instituições com filtros e paginação
  static async getInstitutions(options: InstitutionFilter = {}): Promise<PaginatedResponse<InstitutionDto>> {
    try {
      const params = new URLSearchParams();
      
      if (options.search) params.append('search', options.search);
      if (options.type) params.append('type', options.type);
      if (options.is_active !== undefined) params.append('is_active', options.is_active.toString());
      if (options.city) params.append('city', options.city);
      if (options.state) params.append('state', options.state);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar instituições');
      }

      const result = await response.json();
      
      // Validar estrutura da resposta
      const validatedResponse = validateApiResponse<PaginatedResponse<InstitutionDto>>(result);
      if (!validatedResponse || !validatedResponse.data) {
        throw new Error('Estrutura de resposta inválida da API');
      }

      // Migrar campos legados se necessário
      const migratedData = {
        ...validatedResponse.data,
        items: validatedResponse.data.items.map(institution => 
          migrateContactFields(institution)
        )
      };

      return migratedData;
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
      throw error;
    }
  }

  // Obter instituição por ID
  static async getInstitutionById(id: string): Promise<InstitutionDto> {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Instituição não encontrada');
        }
        throw new Error('Falha ao buscar instituição');
      }

      const result = await response.json();
      
      // Validar estrutura da resposta
      const validatedResponse = validateApiResponse<InstitutionDto>(result);
      if (!validatedResponse || !validatedResponse.data) {
        throw new Error('Estrutura de resposta inválida da API');
      }

      // Migrar campos legados se necessário
      return migrateContactFields(validatedResponse.data);
    } catch (error) {
      console.error('Erro ao buscar instituição:', error);
      throw error;
    }
  }

  // Criar nova instituição
  static async createInstitution(institutionData: CreateInstitutionDto): Promise<InstitutionDto> {
    try {
      // Validar dados antes de enviar
      const validation = validateInstitutionData(institutionData);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      // Migrar campos legados e formatar dados
      const processedData = migrateContactFields(institutionData);
      
      // Formatar telefone se fornecido
      if (processedData.phone) {
        processedData.phone = formatPhone(processedData.phone);
      }

      // Garantir compatibilidade com backend que ainda espera campos legados
      const compatibleData = ensureLegacyCompatibility(processedData);

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compatibleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar instituição');
      }

      const result = await response.json();
      
      // Validar estrutura da resposta
      const validatedResponse = validateApiResponse<InstitutionDto>(result);
      if (!validatedResponse || !validatedResponse.data) {
        throw new Error('Estrutura de resposta inválida da API');
      }

      return migrateContactFields(validatedResponse.data);
    } catch (error) {
      console.error('Erro ao criar instituição:', error);
      throw error;
    }
  }

  // Atualizar instituição
  static async updateInstitution(id: string, updateData: UpdateInstitutionDto): Promise<InstitutionDto> {
    try {
      // Validar dados antes de enviar (apenas campos fornecidos)
      if (Object.keys(updateData).length > 0) {
        const validation = validateInstitutionData(updateData);
        if (!validation.isValid) {
          throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }
      }

      // Migrar campos legados e formatar dados
      const processedData = migrateContactFields(updateData);
      
      // Formatar telefone se fornecido
      if (processedData.phone) {
        processedData.phone = formatPhone(processedData.phone);
      }

      // Garantir compatibilidade com backend
      const compatibleData = ensureLegacyCompatibility(processedData);

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compatibleData),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Instituição não encontrada');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar instituição');
      }

      const result = await response.json();
      
      // Validar estrutura da resposta
      const validatedResponse = validateApiResponse<InstitutionDto>(result);
      if (!validatedResponse || !validatedResponse.data) {
        throw new Error('Estrutura de resposta inválida da API');
      }

      return migrateContactFields(validatedResponse.data);
    } catch (error) {
      console.error('Erro ao atualizar instituição:', error);
      throw error;
    }
  }

  // Buscar instituições por nome
  static async searchInstitutionsByName(name: string): Promise<InstitutionDto[]> {
    try {
      const options: InstitutionFilter = {
        search: name,
        limit: 50 // Limite maior para busca
      };
      
      const result = await this.getInstitutions(options);
      return result.items;
    } catch (error) {
      console.error('Erro ao buscar instituições por nome:', error);
      throw error;
    }
  }

  // Verificar se instituição pode ser deletada
  static async canDeleteInstitution(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${id}/can-delete`);
      
      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      
      // Validar estrutura da resposta
      const validatedResponse = validateApiResponse<{ canDelete: boolean }>(result);
      if (!validatedResponse || !validatedResponse.data) {
        return false;
      }

      return validatedResponse.data.canDelete;
    } catch (error) {
      console.error('Erro ao verificar se instituição pode ser deletada:', error);
      return false;
    }
  }

  // Alternar status ativo/inativo
  static async toggleInstitutionStatus(id: string): Promise<InstitutionDto> {
    try {
      const response = await fetch(`${API_BASE}/${id}/toggle-status`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Instituição não encontrada');
        }
        throw new Error('Falha ao alterar status da instituição');
      }

      const result = await response.json();
      
      // Validar estrutura da resposta
      const validatedResponse = validateApiResponse<InstitutionDto>(result);
      if (!validatedResponse || !validatedResponse.data) {
        throw new Error('Estrutura de resposta inválida da API');
      }

      return migrateContactFields(validatedResponse.data);
    } catch (error) {
      console.error('Erro ao alterar status da instituição:', error);
      throw error;
    }
  }

  // Obter todas as instituições (sem paginação)
  static async getAll(): Promise<InstitutionDto[]> {
    try {
      const options: InstitutionFilter = {
        limit: 1000, // Limite alto para obter todas
        is_active: true
      };
      
      const result = await this.getInstitutions(options);
      return result.items;
    } catch (error) {
      console.error('Erro ao buscar todas as instituições:', error);
      throw error;
    }
  }

  // Obter apenas instituições ativas
  static async getActiveInstitutions(): Promise<InstitutionDto[]> {
    try {
      const options: InstitutionFilter = {
        is_active: true,
        limit: 1000
      };
      
      const result = await this.getInstitutions(options);
      return result.items;
    } catch (error) {
      console.error('Erro ao buscar instituições ativas:', error);
      throw error;
    }
  }

  // Exportar instituições
  static async exportInstitutions(format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE}/export?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Falha ao exportar instituições');
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro ao exportar instituições:', error);
      throw error;
    }
  }

  // Importar instituições
  static async importInstitutions(file: File): Promise<{ success: number; errors: string[] }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha ao importar instituições');
      }

      const result = await response.json();
      
      // Validar estrutura da resposta
      const validatedResponse = validateApiResponse<{ success: number; errors: string[] }>(result);
      if (!validatedResponse || !validatedResponse.data) {
        throw new Error('Estrutura de resposta inválida da API');
      }

      return validatedResponse.data;
    } catch (error) {
      console.error('Erro ao importar instituições:', error);
      throw error;
    }
  }
}

// Instância singleton para compatibilidade
export const institutionService = InstitutionService;
