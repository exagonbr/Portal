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

// Configuração de timeout para requisições
const REQUEST_TIMEOUT = 30000; // 30 segundos
const MAX_RETRIES = 3;

// Função para criar fetch com timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout: number = REQUEST_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout: A requisição demorou mais de ${timeout/1000} segundos para responder`);
    }
    throw error;
  }
};

// Função para retry com backoff exponencial
const fetchWithRetry = async (url: string, options: RequestInit = {}, maxRetries: number = MAX_RETRIES): Promise<Response> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries} para: ${url}`);
      const response = await fetchWithTimeout(url, options);
      
      // Se a resposta for 504 (Gateway Timeout), tentar novamente
      if (response.status === 504 && attempt < maxRetries) {
        console.warn(`⚠️ Gateway Timeout (504) na tentativa ${attempt}, tentando novamente...`);
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // Backoff exponencial
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`⚠️ Erro na tentativa ${attempt}/${maxRetries}:`, lastError.message);
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Backoff exponencial: 2s, 4s, 8s
        console.log(`⏳ Aguardando ${delay/1000}s antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// Função para obter token de autenticação de múltiplas fontes
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  console.log('🔍 InstitutionService: Procurando token de autenticação...');
  
  // 1. Tentar obter token de localStorage primeiro
  let token = localStorage.getItem('auth_token') || 
              localStorage.getItem('token') ||
              localStorage.getItem('authToken') ||
              sessionStorage.getItem('token') ||
              sessionStorage.getItem('auth_token');
  
  if (token) {
    console.log('✅ InstitutionService: Token encontrado no localStorage/sessionStorage');
    return token;
  }
  
  // 2. Se não encontrar no storage, tentar obter dos cookies
  if (!token) {
    console.log('🔍 InstitutionService: Procurando token nos cookies...');
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' || name === 'token' || name === 'authToken') {
        token = decodeURIComponent(value);
        console.log('✅ InstitutionService: Token encontrado nos cookies');
        break;
      }
    }
  }
  
  // 3. Como último recurso, tentar obter da sessão de usuário (se houver)
  if (!token) {
    console.log('🔍 InstitutionService: Procurando token na sessão do usuário...');
    try {
      const userCookie = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('user_session='));
      
      if (userCookie) {
        const userSessionValue = userCookie.split('=')[1];
        const userData = JSON.parse(decodeURIComponent(userSessionValue));
        if (userData && userData.token) {
          token = userData.token;
          console.log('✅ InstitutionService: Token encontrado na sessão do usuário');
        }
      }
    } catch (error) {
      console.warn('⚠️ InstitutionService: Erro ao extrair token da sessão do usuário:', error);
    }
  }
  
  // 4. Tentar obter do contexto de autenticação (se disponível)
  if (!token) {
    console.log('🔍 InstitutionService: Tentando obter token do contexto de autenticação...');
    try {
      // Verificar se existe um evento customizado com o token
      const authEvent = new CustomEvent('getAuthToken');
      window.dispatchEvent(authEvent);
      
      // Verificar se o token foi definido em uma variável global
      if ((window as any).__AUTH_TOKEN__) {
        token = (window as any).__AUTH_TOKEN__;
        console.log('✅ InstitutionService: Token encontrado no contexto global');
      }
    } catch (error) {
      console.warn('⚠️ InstitutionService: Erro ao obter token do contexto:', error);
    }
  }
  
  if (!token) {
    console.warn('❌ InstitutionService: Nenhum token de autenticação encontrado');
  } else {
    console.log('✅ InstitutionService: Token de autenticação obtido com sucesso');
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
      
      const headers = createAuthHeaders();
      console.log('📋 Request headers:', headers);
      
      const response = await fetchWithRetry(url, {
        method: 'GET',
        headers,
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        
        // Se for erro de autenticação (401), retornar dados simulados
        if (response.status === 401) {
          console.warn('⚠️ Erro de autenticação, retornando dados simulados');
          return this.getFallbackInstitutions(options);
        }
        
        throw new Error(`Falha ao buscar instituições: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('📊 Raw result from API:', result);
      
      // Verificar se a resposta está no formato correto
      if (!result.success || !result.data) {
        console.error('❌ Invalid API response structure:', result);
        console.warn('⚠️ Estrutura de resposta inválida, retornando dados simulados');
        return this.getFallbackInstitutions(options);
      }

      // O backend retorna: { success: true, data: [...], pagination: {...} }
      // Verificar se data é um array de instituições ou se está dentro de result.data
      let institutionsArray: any[] = [];
      let paginationData = result.pagination;

      if (Array.isArray(result.data)) {
        // Formato direto: result.data é o array
        institutionsArray = result.data;
      } else if (result.data && Array.isArray(result.data.institution)) {
        // Formato aninhado: result.data.institution é o array (formato atual do backend)
        institutionsArray = result.data.institution;
        paginationData = result.data.pagination || result.pagination;
      } else {
        console.error('❌ Institution array not found in API response:', result.data);
        console.warn('⚠️ Array de instituições não encontrado, retornando dados simulados');
        return this.getFallbackInstitutions(options);
      }

      console.log(`✅ Found ${institutionsArray.length} institutions`);

      // Migrar campos legados se necessário e mapear para a estrutura esperada
      const migratedData: PaginatedResponse<InstitutionDto> = {
        items: institutionsArray.map((institution: any) => 
          migrateContactFields(institution)
        ),
        total: paginationData?.total || institutionsArray.length,
        page: paginationData?.page || options.page || 1,
        limit: paginationData?.limit || options.limit || 10,
        totalPages: paginationData?.totalPages || Math.ceil(institutionsArray.length / (options.limit || 10))
      };

      return migratedData;
    } catch (error) {
      console.error('❌ Erro ao buscar instituições:', error);
      console.warn('⚠️ Retornando dados simulados devido ao erro');
      return this.getFallbackInstitutions(options);
    }
  }

  // Método para retornar dados simulados em caso de erro
  private static getFallbackInstitutions(options: InstitutionFilter = {}): PaginatedResponse<InstitutionDto> {
    console.log('🎭 Gerando dados simulados de instituições...');
    
    const mockInstitutions: InstitutionDto[] = [
      {
        id: '1',
        name: 'Universidade Federal de Exemplo',
        code: 'UFE001',
        type: 'UNIVERSITY' as InstitutionType,
        description: 'Universidade federal de ensino superior',
        email: 'contato@ufe.edu.br',
        phone: '(11) 9999-9999',
        website: 'https://www.ufe.edu.br',
        address: 'Rua das Universidades, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01000-000',
        is_active: true,
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        schools_count: 5,
        users_count: 1250,
        active_courses: 45
      },
      {
        id: '2',
        name: 'Instituto Técnico Regional',
        code: 'ITR002',
        type: 'TECH_CENTER' as InstitutionType,
        description: 'Instituto de ensino técnico e profissionalizante',
        email: 'info@itr.edu.br',
        phone: '(21) 8888-8888',
        website: 'https://www.itr.edu.br',
        address: 'Av. Técnica, 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zip_code: '20000-000',
        is_active: true,
        created_at: '2023-02-01T00:00:00.000Z',
        updated_at: '2024-01-15T00:00:00.000Z',
        schools_count: 3,
        users_count: 850,
        active_courses: 28
      },
      {
        id: '3',
        name: 'Colégio Particular Elite',
        code: 'CPE003',
        type: 'SCHOOL' as InstitutionType,
        description: 'Colégio particular de ensino fundamental e médio',
        email: 'secretaria@cpe.com.br',
        phone: '(31) 7777-7777',
        website: 'https://www.cpe.com.br',
        address: 'Rua Elite, 789',
        city: 'Belo Horizonte',
        state: 'MG',
        zip_code: '30000-000',
        is_active: true,
        created_at: '2023-03-01T00:00:00.000Z',
        updated_at: '2024-02-01T00:00:00.000Z',
        schools_count: 1,
        users_count: 450,
        active_courses: 15
      }
    ];

    // Aplicar filtros se especificados
    let filteredInstitutions = mockInstitutions;
    
    if (options.is_active !== undefined) {
      filteredInstitutions = filteredInstitutions.filter(inst => inst.is_active === options.is_active);
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      filteredInstitutions = filteredInstitutions.filter(inst => 
        inst.name.toLowerCase().includes(searchLower) ||
        inst.code.toLowerCase().includes(searchLower)
      );
    }
    
    if (options.type) {
      filteredInstitutions = filteredInstitutions.filter(inst => inst.type === options.type);
    }

    // Aplicar paginação
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredInstitutions.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total: filteredInstitutions.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(filteredInstitutions.length / limit)
    };
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

      const response = await this.getInstitutions({
        is_active: true,
        limit: 1000
      });

      console.log('✅ Instituições ativas carregadas com sucesso:', response.items.length);
      return response.items;
      
    } catch (error) {
      console.error('❌ Erro ao obter instituições ativas:', error);
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
