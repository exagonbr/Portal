/**
 * Configuração centralizada de URLs
 * Exporta funções para obter URLs da API usando variáveis de ambiente
 */

import { ENV_CONFIG, getApiUrl, getInternalApiUrl } from './env';

// Re-exportar as funções principais do env.ts
export { getApiUrl, getInternalApiUrl };

// Re-exportar as URLs base
export const {
  FRONTEND_URL,
  BACKEND_URL,
  API_BASE_URL,
  INTERNAL_API_URL
} = ENV_CONFIG;

// Função helper para construir URLs completas
export const buildUrl = (baseUrl: string, path: string = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// URLs específicas para diferentes contextos
export const URLS = {
  // Frontend
  FRONTEND: ENV_CONFIG.FRONTEND_URL,
  
  // API endpoints
  API: {
    BASE: ENV_CONFIG.API_BASE_URL,
    INTERNAL: ENV_CONFIG.INTERNAL_API_URL,
    
    // Endpoints específicos
    AUTH: {
      LOGIN: getInternalApiUrl('/auth/optimized/login'),
      LOGOUT: getInternalApiUrl('/auth/logout'),
      REGISTER: getInternalApiUrl('/auth/register'),
      REFRESH: getInternalApiUrl('/auth/refresh'),
    },
    
    // Outros endpoints podem ser adicionados aqui
    USERS: getApiUrl('/users'),
    COURSES: getApiUrl('/courses'),
    ASSIGNMENTS: getApiUrl('/assignments'),
  }
} as const;

export default URLS;