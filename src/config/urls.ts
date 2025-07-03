/**
 * Arquivo central para constantes de rotas da API.
 * As rotas devem ser relativas (ex: '/users').
 * O `api-client` é responsável por adicionar a URL base.
 */

import { getApiUrl, getInternalApiUrl, ENV_CONFIG } from './env';

// Re-exportar funções para manter compatibilidade
export { getApiUrl, getInternalApiUrl };

export const FRONTEND_URL = ENV_CONFIG.FRONTEND_URL;

// Função para construir URLs completas
export function buildUrl(path: string): string {
  const baseUrl = FRONTEND_URL || '';
  return `${baseUrl}${path}`;
}

// --- Constantes de Rotas da API ---

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/optimized/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/users',
    STATS: '/users/stats',
    ME: '/users/me',
    BY_ID: (id: string | number) => `/users/${id}`,
    ACTIVATE: (id: string | number) => `/users/${id}/activate`,
    DEACTIVATE: (id: string | number) => `/users/${id}/deactivate`,
    RESET_PASSWORD: (id: string | number) => `/users/${id}/reset-password`,
    SEARCH: '/users/search',
    BY_ROLE: (roleId: string) => `/users/role/${roleId}`,
    BY_INSTITUTION: (institutionId: number) => `/users/institution/${institutionId}`,
  },
  COURSES: '/courses',
  ASSIGNMENTS: '/assignments',
  // Adicione outras rotas base aqui
} as const;

// Para manter compatibilidade com o uso antigo de `URLS`
export const URLS = {
  FRONTEND: ENV_CONFIG.FRONTEND_URL,
  API: {
    BASE: ENV_CONFIG.API_BASE_URL,
    INTERNAL: ENV_CONFIG.INTERNAL_API_URL,
    ...API_ROUTES,
  },
};

export default URLS;
