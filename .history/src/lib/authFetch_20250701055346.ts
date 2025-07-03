/**
 * 🌐 SERVIÇO DE FETCH UNIFICADO COM AUTENTICAÇÃO
 * 
 * ✅ Adiciona automaticamente Bearer token
 * ✅ Auto-refresh quando token expira
 * ✅ Tratamento de erros padronizado
 * ✅ Respostas tipadas
 */

// URLs da API
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.sabercon.com.br' 
  : 'http://localhost:3001';

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * 🔐 FETCH COM AUTENTICAÇÃO AUTOMÁTICA
 */
export async function authFetch<T = any>(
  url: string, 
  options: AuthFetchOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, skipRefresh = false, ...fetchOptions } = options;
  
  // Construir URL completa se necessário
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  // Adicionar headers padrão
  const headers = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  };

  // Adicionar Authorization header se não skipAuth
  if (!skipAuth) {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  try {
    // Primeira tentativa
    let response = await fetch(fullUrl, {
      ...fetchOptions,
      headers
    });

    // Se token expirado (401) e não skipRefresh, tentar refresh
    if (response.status === 401 && !skipAuth && !skipRefresh) {
      console.log('🔄 Token expirado, tentando refresh...');
      
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // Tentar novamente com novo token
        const newToken = localStorage.getItem('accessToken');
        headers['Authorization'] = `Bearer ${newToken}`;
        
        response = await fetch(fullUrl, {
          ...fetchOptions,
          headers
        });
        
        console.log('✅ Requisição refeita com novo token');
      } else {
        // Refresh falhou, redirecionar para login
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
        throw new Error('Sessão expirada');
      }
    }

    // Parse da resposta
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data as ApiResponse<T>;

  } catch (error) {
    console.error('❌ Erro no authFetch:', error);
    throw error;
  }
}

/**
 * 🔄 RENOVAR ACCESS TOKEN
 */
async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include' // Incluir cookies httpOnly
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.success && data.data.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
        console.log('✅ Access token renovado');
        return true;
      }
    }

    console.log('❌ Falha no refresh do token');
    return false;
  } catch (error) {
    console.error('❌ Erro no refresh:', error);
    return false;
  }
}

/**
 * 🎯 MÉTODOS HTTP ESPECÍFICOS
 */

export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, options?: AuthFetchOptions) => 
    authFetch<T>(url, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, options?: AuthFetchOptions) => 
    authFetch<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    }),

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, options?: AuthFetchOptions) => 
    authFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    }),

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, options?: AuthFetchOptions) => 
    authFetch<T>(url, { ...options, method: 'DELETE' }),

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, options?: AuthFetchOptions) => 
    authFetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
};

/**
 * 🔐 UTILITÁRIOS DE AUTENTICAÇÃO
 */

export const auth = {
  /**
   * Verificar se usuário está logado
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Obter token atual
   */
  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Fazer logout (limpar token local)
   */
  logout: (): void => {
    localStorage.removeItem('accessToken');
    window.location.href = '/auth/login';
  },

  /**
   * Obter dados do usuário atual
   */
  getCurrentUser: async () => {
    try {
      return await api.get('/api/auth/me');
    } catch (error) {
      console.error('❌ Erro ao obter usuário atual:', error);
      return null;
    }
  },

  /**
   * Validar token atual
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const response = await api.get('/api/auth/validate');
      return response.success;
    } catch (error) {
      return false;
    }
  }
};

export default authFetch; 