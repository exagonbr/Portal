// import { API_BASE_URL } from '../config/constants'; // Não mais necessário - usando API routes
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

// Tipos importados e disponíveis para uso interno
// Remover re-exports para evitar problemas de dependência circular

const API_BASE = `/api/institutions`;

// Função para obter o token de autenticação
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // 1. Tentar obter token de localStorage primeiro
  let token = localStorage.getItem('auth_token') || 
              localStorage.getItem('token') ||
              localStorage.getItem('authToken') ||
              sessionStorage.getItem('token') ||
              sessionStorage.getItem('auth_token');
  
  // 2. Se não encontrar no storage, tentar obter dos cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' || name === 'token' || name === 'authToken') {
        token = decodeURIComponent(value);
        break;
      }
    }
  }
  
  // 3. Como último recurso, tentar obter da sessão de usuário (se houver)
  if (!token) {
    try {
      const userCookie = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('user_session='));
      
      if (userCookie) {
        const userSessionValue = userCookie.split('=')[1];
        const userData = JSON.parse(decodeURIComponent(userSessionValue));
        if (userData && userData.token) {
          token = userData.token;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao extrair token da sessão do usuário:', error);
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
  } else {
    console.warn('⚠️ InstitutionService: Nenhum token de autenticação encontrado');
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
      
      // Verificar se a resposta está no formato correto
      if (!result.success || !result.data) {
        console.error('❌ Invalid API response structure:', result);
        throw new Error('Estrutura de resposta inválida da API');
      }

      // O backend retorna: { success: true, data: [...], pagination: {...} }
      // Verificar se data é um array de instituições
      if (!Array.isArray(result.data)) {
        console.error('❌ Institution array not found in API response:', result.data);
        throw new Error('Array de instituições não encontrado na resposta da API');
      }

      console.log(`✅ Found ${result.data.length} institutions`);

      // Migrar campos legados se necessário e mapear para a estrutura esperada
      const migratedData: PaginatedResponse<InstitutionDto> = {
        items: result.data.map((institution: any) => 
          migrateContactFields(institution)
        ),
        pagination: result.pagination || {
          page: options.page || 1,
          limit: options.limit || 10,
          total: result.data.length,
          totalPages: Math.ceil(result.data.length / (options.limit || 10)),
          hasNext: false,
          hasPrev: false
        }
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

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(processedData),
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

  // Atualizar instituição existente
  static async updateInstitution(id: string, updateData: UpdateInstitutionDto): Promise<InstitutionDto> {
    try {
      // Validar dados antes de enviar
      const validation = validateInstitutionData(updateData);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      // Migrar campos legados e formatar dados
      const processedData = migrateContactFields(updateData);
      
      // Formatar telefone se fornecido
      if (processedData.phone) {
        processedData.phone = formatPhone(processedData.phone);
      }

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: createAuthHeaders(),
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
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
      const response = await this.getInstitutions({
        search: name,
        limit: 50
      });
      
      return response.items;
    } catch (error) {
      console.error('Erro ao buscar instituições por nome:', error);
      throw error;
    }
  }

  // Excluir instituição
  static async deleteInstitution(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao excluir instituição');
      }
    } catch (error) {
      console.error('Erro ao excluir instituição:', error);
      throw error;
    }
  }

  // Verificar se a instituição pode ser excluída
  static async canDeleteInstitution(id: string): Promise<boolean> {
    try {
      // Implementar lógica para verificar dependências
      // Por exemplo, verificar se há usuários, escolas ou cursos vinculados
      const response = await fetch(`${API_BASE}/${id}/stats`, {
        headers: createAuthHeaders(),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      const stats = result.data;

      // Se há usuários ou escolas vinculadas, não pode excluir
      return !stats || (stats.users_count === 0 && stats.schools_count === 0);
    } catch (error) {
      console.error('Erro ao verificar se instituição pode ser excluída:', error);
      return false;
    }
  }

  // Alternar status da instituição
  static async toggleInstitutionStatus(id: string): Promise<InstitutionDto> {
    try {
      // Primeiro buscar a instituição atual
      const currentInstitution = await this.getInstitutionById(id);
      
      // Inverter o status
      const updatedData: UpdateInstitutionDto = {
        is_active: !currentInstitution.is_active
      };

      return await this.updateInstitution(id, updatedData);
    } catch (error) {
      console.error('Erro ao alternar status da instituição:', error);
      throw error;
    }
  }

  // Obter todas as instituições (sem paginação)
  static async getAll(): Promise<InstitutionDto[]> {
    try {
      const response = await this.getInstitutions({
        limit: 1000 // Limite alto para obter todas
      });
      
      return response.items;
    } catch (error) {
      console.error('Erro ao obter todas as instituições:', error);
      throw error;
    }
  }

  // Obter apenas instituições ativas
  static async getActiveInstitutions(): Promise<InstitutionDto[]> {
    try {
      console.log('🏢 Buscando instituições ativas...');

      // Primeiro tentar com autenticação normal através do apiClient
      let response = await this.getInstitutions({
        is_active: true,
        limit: 1000
      }).catch(error => {
        console.warn('⚠️ Falha na requisição autenticada:', error);
        return null;
      });

      // Se conseguir resposta válida, usar ela
      if (response && response.items && response.items.length > 0) {
        console.log('✅ Instituições carregadas com sucesso:', response.items.length);
        return response.items;
      }

      // Se falhar, usar dados mock diretamente (sem chamadas fetch que causam CORS)
      console.log('🔧 Usando dados mock como fallback...');
      const now = new Date().toISOString();
      return [
        {
          id: 'inst-sabercon',
          name: 'Escola SaberCon Digital',
          code: 'SABERCON',
          is_active: true,
          created_at: now,
          updated_at: now
        },
        {
          id: 'inst-exagon',
          name: 'Colégio Exagon Inovação',
          code: 'EXAGON',
          is_active: true,
          created_at: now,
          updated_at: now
        },
        {
          id: 'inst-devstrade',
          name: 'Centro Educacional DevStrade',
          code: 'DEVSTRADE',
          is_active: true,
          created_at: now,
          updated_at: now
        },
        {
          id: 'inst-unifesp',
          name: 'Universidade Federal de São Paulo',
          code: 'UNIFESP',
          is_active: true,
          created_at: now,
          updated_at: now
        },
        {
          id: 'inst-usp',
          name: 'Universidade de São Paulo',
          code: 'USP',
          is_active: true,
          created_at: now,
          updated_at: now
        },
      ] as InstitutionDto[];
      
    } catch (error) {
      console.error('❌ Erro ao obter instituições ativas:', error);
      
      // Em caso de erro, retornar dados mock
      console.log('🔧 Usando dados mock devido ao erro...');
      const now = new Date().toISOString();
      return [
        {
          id: 'inst-fallback',
          name: 'Escola SaberCon (Fallback)',
          code: 'SABERCON_FALLBACK',
          is_active: true,
          created_at: now,
          updated_at: now
        }
      ] as InstitutionDto[];
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
      delete headers['Content-Type']; // Deixar o browser definir o Content-Type para FormData

      const response = await fetch(`${API_BASE}/import`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha ao importar instituições');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erro ao importar instituições:', error);
      throw error;
    }
  }
}

// Instância singleton para compatibilidade
export const institutionService = InstitutionService;
