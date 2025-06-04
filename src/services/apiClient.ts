import { ApiResponse, ApiError } from '../types/api';

// Configuração base da API - Remover /api do final para evitar duplicação
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// URL específica para API Routes do Next.js (rotas que começam com /api no frontend)
const NEXTJS_API_BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Classe para erros da API
export class ApiClientError extends Error {
  public status: number;
  public errors?: string[];

  constructor(message: string, status: number, errors?: string[]) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

// Interface para opções de requisição
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  skipAuthRefresh?: boolean;
}

// Classe principal do cliente API
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Obtém o token de autenticação do localStorage ou cookies
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Tenta obter do localStorage primeiro
    const token = localStorage.getItem('auth_token');
    if (token) return token;

    // Fallback para cookies
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    return cookieToken || null;
  }

  /**
   * Obtém o refresh token
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Tenta obter do localStorage primeiro
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) return refreshToken;
    
    // Fallback para cookies
    const cookieRefreshToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('refresh_token='))
      ?.split('=')[1];
    
    return cookieRefreshToken || null;
  }

  /**
   * Atualiza o token de autenticação
   */
  private async refreshAuthToken(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('Refresh token não disponível. Por favor, faça login novamente.');
      }

      console.log('🔄 Tentando atualizar token de autenticação...');
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Falha ao atualizar token (${response.status}):`, errorText);
        throw new Error(`Falha ao atualizar token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
          
          // Atualizar também o cookie
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30); // Expira em 30 dias
          document.cookie = `refresh_token=${data.refresh_token}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
        }
        if (data.expires_at) {
          localStorage.setItem('auth_expires_at', data.expires_at);
        }
        console.log('✅ Token atualizado com sucesso');
      } else {
        console.error('❌ Resposta inválida ao atualizar token:', data);
        throw new Error('Resposta inválida ao atualizar token');
      }
    } catch (error) {
      // Limpa dados de autenticação em caso de erro
      this.clearAuth();
      console.error('❌ Erro ao atualizar token:', error);
      throw error;
    }
  }

  /**
   * Constrói URL completa com parâmetros
   * 
   * NOTA: As rotas de queue (/queue/*) são direcionadas para as API Routes do Next.js
   * (localhost:3001/api/queue/*) ao invés do backend Express (localhost:3001/api/queue/*)
   * para aproveitar o middleware de autenticação do Next.js
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Para rotas de queue, usar API Routes do Next.js
    let baseUrl = this.baseURL;
    if (endpoint.startsWith('/queue') || endpoint.startsWith('queue')) {
      baseUrl = NEXTJS_API_BASE_URL + '/api';
      // Remove barra inicial se existir para evitar duplicação
      endpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    } else {
      // Para outras rotas, garantir que não haja barra inicial duplicada
      endpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    }
    
    const url = new URL(`${baseUrl}/${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    
    return url.toString();
  }

  /**
   * Prepara os headers da requisição
   */
  private prepareHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    // Adiciona token de autenticação se disponível
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Faz uma requisição HTTP
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers: customHeaders,
      body,
      params,
      timeout = 30000,
      skipAuthRefresh = false
    } = options;

    try {
      const url = this.buildURL(endpoint, params);
      const headers = this.prepareHeaders(customHeaders);

      // Remove Content-Type para FormData
      if (body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const requestOptions: RequestInit = {
        method,
        headers,
        body: body instanceof FormData ? body : JSON.stringify(body),
      };

      // Implementa timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Se receber 401 e não estiver tentando refresh, tenta atualizar o token
      if (response.status === 401 && !skipAuthRefresh) {
        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshAuthToken();
        }
        
        await this.refreshPromise;
        this.refreshPromise = null;
        
        // Tenta a requisição novamente com o novo token
        return this.makeRequest<T>(endpoint, {
          ...options,
          skipAuthRefresh: true
        });
      }

      // Parse da resposta
      let responseData: ApiResponse<T>;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        // Para respostas não-JSON, cria uma resposta padrão
        responseData = {
          success: response.ok,
          data: (await response.text()) as any,
          message: response.ok ? 'Success' : 'Request failed'
        };
      }

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        throw new ApiClientError(
          responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          responseData.errors
        );
      }

      return responseData;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiClientError('Request timeout', 408);
        }
        throw new ApiClientError(error.message, 0);
      }

      throw new ApiClientError('Unknown error occurred', 0);
    }
  }

  /**
   * Métodos HTTP convenientes
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload de arquivo
   */
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Download de arquivo
   */
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    try {
      const url = this.buildURL(endpoint);
      const headers = this.prepareHeaders();

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new ApiClientError(`Download failed: ${response.statusText}`, response.status);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError('Download failed', 0);
    }
  }

  /**
   * Interceptador para tratamento global de erros
   */
  setErrorInterceptor(interceptor: (error: ApiClientError) => void): void {
    // Implementar se necessário
  }

  /**
   * Interceptador para requisições
   */
  setRequestInterceptor(interceptor: (config: RequestOptions) => RequestOptions): void {
    // Implementar se necessário
  }

  /**
   * Limpa dados de autenticação
   */
  clearAuth(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('user_data');

    // Limpa cookies também
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  /**
   * Define o token de autenticação
   */
  setAuthToken(token: string, refreshToken?: string, expiresAt?: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('auth_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
      
      // Salvar também como cookie para redundância
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30); // Expira em 30 dias
      document.cookie = `refresh_token=${refreshToken}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
    }
    if (expiresAt) {
      localStorage.setItem('auth_expires_at', expiresAt);
    }
  }
}

// Instância singleton do cliente API
export const apiClient = new ApiClient();

// Função helper para tratamento de erros
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiClientError) {
    if (error.errors && error.errors.length > 0) {
      return error.errors.join(', ');
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Erro desconhecido';
};

// Função helper para verificar se é erro de autenticação
export const isAuthError = (error: unknown): boolean => {
  return error instanceof ApiClientError && (error.status === 401 || error.status === 403);
};

// Função helper para verificar se é erro de endpoint não encontrado
export const isNotFoundError = (error: unknown): boolean => {
  if (error instanceof ApiClientError && error.status === 404) {
    return true;
  }
  
  // Verifica se é uma resposta de API com mensagem específica
  if (error instanceof ApiClientError && 
      typeof error.message === 'string' && 
      error.message.includes('Endpoint não encontrado')) {
    return true;
  }
  
  return false;
};

// Função helper para retry automático
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Não faz retry para erros de autenticação ou validação
      if (error instanceof ApiClientError && (error.status === 401 || error.status === 400)) {
        throw error;
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
};

// Função para lidar com endpoints não encontrados
export const handleNotFoundEndpoint = (error: unknown, fallbackData: any = null): any => {
  if (isNotFoundError(error)) {
    console.warn('Endpoint não encontrado. Usando dados de fallback.');
    return fallbackData;
  }
  
  // Se não for erro de endpoint não encontrado, propaga o erro
  throw error;
};

// Função para buscar usuários
export const fetchUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: 'active' | 'inactive' | 'all';
}) => {
  try {
    const response = await apiClient.get('/users', params);
    return response;
  } catch (error) {
    // Fornece dados de fallback caso o endpoint não exista ainda
    if (isNotFoundError(error)) {
      console.warn(`Endpoint /users não encontrado. Usando dados de fallback.`);
      
      // Simulação básica de dados de usuários para desenvolvimento
      const fallbackUsers = [
        { id: 1, name: 'Usuário Teste 1', email: 'usuario1@exemplo.com', status: 'active', createdAt: new Date().toISOString() },
        { id: 2, name: 'Usuário Teste 2', email: 'usuario2@exemplo.com', status: 'active', createdAt: new Date().toISOString() },
        { id: 3, name: 'Usuário Teste 3', email: 'usuario3@exemplo.com', status: 'inactive', createdAt: new Date().toISOString() },
      ];
      
      // Aplica filtragem básica se houver parâmetros
      let filteredUsers = [...fallbackUsers];
      
      if (params?.status && params.status !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === params.status);
      }
      
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user => user.name.toLowerCase().includes(searchLower) || 
                 user.email.toLowerCase().includes(searchLower)
        );
      }
      
      // Simulação de paginação
      const total = filteredUsers.length;
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const offset = (page - 1) * limit;
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);
      
      return {
        success: true,
        data: {
          items: paginatedUsers,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        },
        message: 'Dados de usuários (fallback)'
      };
    }
    
    // Se não for erro de endpoint não encontrado, propaga o erro
    throw error;
  }
};

// Função para obter detalhes de um usuário específico
export const fetchUserById = async (userId: number | string) => {
  try {
    return await apiClient.get(`/users/${userId}`);
  } catch (error) {
    // Fornece dados de fallback caso o endpoint não exista ainda
    if (isNotFoundError(error)) {
      // Simula um usuário específico para desenvolvimento
      const fallbackUser = {
        id: Number(userId),
        name: `Usuário ${userId}`,
        email: `usuario${userId}@exemplo.com`,
        status: 'active',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        profile: {
          avatar: null,
          bio: 'Bio do usuário de teste',
          location: 'São Paulo, Brasil'
        }
      };
      
      return {
        success: true,
        data: fallbackUser,
        message: 'Detalhes do usuário (fallback)'
      };
    }
    
    // Se não for erro de endpoint não encontrado, propaga o erro
    throw error;
  }
};

// Função para obter estatísticas de usuários
export const fetchUserStats = async () => {
  try {
    const response = await apiClient.get('/users/stats');
    return response;
  } catch (error) {
    // Fornece dados de fallback caso o endpoint não exista ainda
    if (isNotFoundError(error)) {
      console.warn('Endpoint /users/stats não encontrado. Usando dados de fallback.');
      
      // Simulação básica de estatísticas de usuários para desenvolvimento
      const fallbackStats = {
        total: 152,
        active: 124,
        inactive: 18,
        blocked: 10,
        new: 27,
        roles: {
          admin: 5,
          teacher: 42,
          student: 95,
          guest: 10
        },
        recentActivity: {
          registrations: 8,
          logins: 62,
          updatedProfiles: 14
        },
        byInstitution: {
          'inst-1': 45,
          'inst-2': 38,
          'inst-3': 69
        }
      };
      
      return {
        success: true,
        data: fallbackStats,
        message: 'Estatísticas de usuários (fallback)'
      };
    }
    
    // Se não for erro de endpoint não encontrado, propaga o erro
    throw error;
  }
};

// Função para obter o próximo item na fila
export const fetchNextQueueItem = async (params?: {
  queueType?: 'default' | 'priority' | 'support' | string;
  departmentId?: number | string;
}) => {
  try {
    console.log('🔄 fetchNextQueueItem: Tentando buscar próximo item da fila...');
    return await apiClient.get('/queue/next', params);
  } catch (error) {
    console.warn('⚠️ fetchNextQueueItem: Erro ao buscar próximo item:', error);
    
    // Fornece dados de fallback caso o endpoint não exista ainda ou haja erro de auth
    if (isNotFoundError(error) || isAuthError(error)) {
      console.warn('🔄 fetchNextQueueItem: Usando dados de fallback devido a erro de endpoint/auth');
      
      // Retorna uma resposta vazia mas válida para evitar quebrar o processamento
      return {
        success: true,
        data: [], // Array vazio indica que não há jobs para processar
        message: 'Nenhum job encontrado na fila (fallback)',
        pagination: {
          limit: 5,
          total: 0
        }
      };
    }
    
    // Se não for erro de endpoint não encontrado ou auth, propaga o erro
    throw error;
  }
};