import { getAuthentication } from '@/lib/auth-utils';
import { PaginatedResponse } from '@/types/api';

const API_BASE_URL = '/api';

/**
 * Retorna os headers padrões para as requisições à API.
 * Inclui o token de autenticação se estiver disponível.
 */
const getHeaders = (): Headers => {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  // Busca o accessToken no localStorage
  const accessToken = getAuthToken();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
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
      console.error('Erro de autenticação: Token inválido ou expirado');
      
      // Se estiver no navegador, podemos redirecionar para a página de login
      if (typeof window !== 'undefined') {
        // Limpar tokens inválidos
        localStorage.removeItem('accessToken');
        localStorage.removeItem('authToken');
        
        // Redirecionar para login após um pequeno delay
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 100);
      }
      
      throw new Error('Sessão expirada ou usuário não autenticado');
    }
    
    try {
      const error = await response.json();
      throw new Error(error.message || `Erro na API: ${response.statusText}`);
    } catch (e) {
      throw new Error(`Erro na API: ${response.statusText}`);
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
  const token = getAuthToken();
  if (!token && typeof window !== 'undefined') {
    console.warn('Tentativa de requisição sem token de autenticação:', endpoint);
  }
  
  const response = await fetch(url, {
    headers: getHeaders(),
    credentials: 'include',
  });
  return handleResponse<T>(response);
};

/**
 * Realiza uma requisição POST para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPost = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
};

/**
 * Realiza uma requisição PUT para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPut = async <T>(endpoint: string, data: any): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<T>(response);
};

/**
 * Realiza uma requisição PATCH para a API.
 * @param endpoint O endpoint da API.
 * @param data O corpo da requisição.
 * @returns Uma promessa que resolve com os dados da resposta.
 */
export const apiPatch = async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
};


/**
 * Realiza uma requisição DELETE para a API.
 * @param endpoint O endpoint da API.
 * @returns Uma promessa que resolve quando a requisição é completada.
 */
export const apiDelete = async (endpoint: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
  });
  await handleResponse<void>(response);
};

function getAuthToken() {
  // Se não estiver no navegador, não temos acesso ao localStorage
  if (typeof window === 'undefined') {
    return null;
  }
  
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
  
  // Log para depuração
  if (!accessToken) {
    console.warn('Token de autenticação não encontrado no localStorage');
  }
  
  return accessToken;
}
