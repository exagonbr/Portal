import { getAuthentication } from '@/lib/auth-utils';
import { PaginatedResponse } from '@/types/api';
import { UnifiedAuthService } from '@/services/unifiedAuthService';

const API_BASE_URL = '/api';

/**
 * Retorna os headers padrões para as requisições à API.
 * Inclui o token de autenticação se estiver disponível.
 */
const getHeaders = (): Headers => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  // Busca o accessToken usando o serviço unificado
  const accessToken = UnifiedAuthService.getAccessToken();
  
  // Verificar se o token existe e tem formato válido
  if (accessToken && typeof accessToken === 'string' && accessToken.length > 20) {
    console.log(`🔑 [API] Usando token para requisição (${accessToken.substring(0, 10)}...)`);
    headers.set('Authorization', `Bearer ${accessToken}`);
    
    // Adicionar também como cookie para maior compatibilidade
    if (typeof document !== 'undefined') {
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
    }
  } else {
    console.warn("⚠️ [API] Token de autenticação não encontrado ou inválido. As requisições à API podem falhar.");
    console.log("🔍 [API] Token encontrado:", accessToken);
    
    // Tentar recuperar token de outras fontes
    if (typeof window !== 'undefined') {
      const alternativeTokens = [
        localStorage.getItem('accessToken'),
        localStorage.getItem('token'),
        localStorage.getItem('authToken'),
        document.cookie.split(';').find(c => c.trim().startsWith('accessToken='))?.split('=')[1]
      ].filter(Boolean);
      
      if (alternativeTokens.length > 0) {
        console.log("🔄 [API] Tentando usar token alternativo");
        const token = alternativeTokens[0];
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
    }
  }
  return headers;
};

/**
 * Manipulador de resposta de fetch.
 * @param response A resposta do fetch.
 * @returns Uma promessa que resolve com os dados JSON.
 * @throws Um erro se a resposta não for 'ok'.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Tratamento especial para erro 401 (Não autorizado)
    if (response.status === 401) {
      console.error('❌ [API] Erro de autenticação: Token inválido ou expirado');
      
      // Se estiver no navegador, podemos redirecionar para a página de login
      if (typeof window !== 'undefined') {
        // Limpar tokens inválidos
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirecionar para login após um pequeno delay
        setTimeout(() => {
          window.location.href = '/auth/login?auth_error=expired';
        }, 100);
      }
      
      throw new Error('Sessão expirada ou usuário não autenticado');
    }
    
    try {
      const error = await response.json();
      throw new Error(error.message || `Erro na API: ${response.status} - ${response.statusText || 'Sem descrição'}`);
    } catch (e) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText || 'Sem descrição'}`);
    }
  }
  // Retorna um objeto vazio se o status for 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  return response.json() as Promise<T>;
}

/**
 * Realiza uma requisição GET para a API.
 * @param endpoint O endpoint da API.
 * @param params Os parâmetros de query.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiGet = async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  let query = '';
  if (params) {
    // Filtrar parâmetros undefined, null ou vazios
    const filteredParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filteredParams[key] = String(value);
      }
    });
    query = new URLSearchParams(filteredParams).toString();
  }
  
  const url = query ? `${API_BASE_URL}${endpoint}?${query}` : `${API_BASE_URL}${endpoint}`;
  
  // Verificar token antes de fazer a requisição
  const token = UnifiedAuthService.getAccessToken();
  if (!token && typeof window !== 'undefined') {
    console.warn('Tentativa de requisição sem token de autenticação:', endpoint);
  }
  
  try {
    const response = await fetch(url, {
      headers: getHeaders(),
      credentials: 'include',
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`Erro ao fazer requisição GET para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza uma requisição POST para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`Erro ao fazer requisição POST para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza uma requisição PUT para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`Erro ao fazer requisição PUT para ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Realiza uma requisição PATCH para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPatch = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`Erro ao fazer requisição PATCH para ${endpoint}:`, error);
    throw error;
  }
};


/**
 * Realiza uma requisição DELETE para a API.
 * @param endpoint O endpoint da API.
 * @returns Uma promessa que resolve quando a requisição é completada.
 */
export const apiDelete = async (endpoint: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    await handleResponse<void>(response);
  } catch (error) {
    console.error(`Erro ao fazer requisição DELETE para ${endpoint}:`, error);
    throw error;
  }
};
