import { PaginatedResponse } from '@/types/api';

const API_BASE_URL = '/api';

/**
 * Manipulador de resposta de fetch.
 * @param response A resposta do fetch.
 * @returns Uma promessa que resolve com os dados JSON.
 * @throws Um erro se a resposta não for 'ok'.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
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
  const query = params ? new URLSearchParams(params).toString() : '';
  const response = await fetch(`${API_BASE_URL}${endpoint}?${query}`);
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
  });
  await handleResponse<void>(response);
};