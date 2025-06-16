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
  InstitutionDto,
  CreateInstitutionDto,
  UpdateInstitutionDto,
  InstitutionType, 
  INSTITUTION_TYPE_LABELS,
  type InstitutionFilter as InstitutionFilters,
  type InstitutionFilter as InstitutionListOptions,
  type InstitutionFilter as InstitutionQueryParams
};

const API_BASE = `${API_BASE_URL}/institutions`;

// Função para obter o token de autenticação
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Tentar obter token de localStorage
  let token = localStorage.getItem('auth_token') || 
              localStorage.getItem('token') ||
              localStorage.getItem('authToken') ||
              sessionStorage.getItem('token') ||
              sessionStorage.getItem('auth_token');
  
  // Se não encontrar no storage, tentar obter dos cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' || name === 'token' || name === 'authToken') {
        token = value;
        break;
      }
    }
  }
  
  return token;
};

// Função para criar headers com autenticação
const createAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

export class InstitutionService {
  // Listar instituições com filtros e paginação
  static async getInstitutions(options: InstitutionFilter = {}): Promise<PaginatedResponse<InstitutionDto>> {
    try {
      const params = new URLSearchParams();
      
      if (options.search) params.append('search', options.search);
      if (options.type) params.append('type', options.type);
      if (options.is_active !== undefined) params.append('active', options.is_active.toString());
      if (options.city) params.append('city', options.city);
      if (options.state) params.append('state', options.state);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const url = `${API_BASE}?${params.toString()}`;
      console.log('🔗 Fetching institutions from:', url);
      
      const response = await fetch(url, {
        headers: createAuthHeaders(),
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Falha ao buscar instituições: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('📊 Raw result from API:', result);
      
      // A API já retorna no formato { success: true, data: { items: [...], pagination: {...} } }
      // Verificar se a resposta está no formato correto
      if (!result.success || !result.data) {
        console.error('❌ Invalid API response structure:', result);
        throw new Error('Estrutura de resposta inválida da API');
      }

      // Verificar se data tem items e pagination
      if (!result.data.items || !Array.isArray(result.data.items)) {
        console.error('❌ Items not found in API response:', result.data);
        throw new Error('Items não encontrados na resposta da API');
      }

      console.log(`✅ Found ${result.data.items.length} institutions`);

      // Migrar campos legados se necessário
      const migratedData = {
        items: result.data.items.map((institution: any) => 
          migrateContactFields(institution)
        ),
        pagination: result.data.pagination
      };

      return migratedData;
    } catch (error) {
      console.error('❌ Erro ao buscar instituições:', error);
      throw error;
    }
  }

  // Obter instituição por ID
  static async getInstitutionById(id: string): Promise<InstitutionDto> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        headers: createAuthHeaders(),
      });
      
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
        headers: createAuthHeaders(),
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
        headers: createAuthHeaders(),
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

  // Deletar instituição
  static async deleteInstitution(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Instituição não encontrada');
        }
        throw new Error('Falha ao deletar instituição');
      }
    } catch (error) {
      console.error('Erro ao deletar instituição:', error);
      throw error;
    }
  }

  // Verificar se instituição pode ser deletada
  static async canDeleteInstitution(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/${id}/can-delete`, {
        headers: createAuthHeaders(),
      });
      
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
        headers: createAuthHeaders(),
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
      const response = await fetch(`${API_BASE}/export?format=${format}`, {
        headers: createAuthHeaders(),
      });
      
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

      const headers = createAuthHeaders();
      // Remove Content-Type header para FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        headers,
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
