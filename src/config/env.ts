/**
 * Configuração centralizada de ambiente
 * Suporta desenvolvimento local e produção
 */

// Detectar ambiente de forma segura
const getNodeEnv = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV || 'development';
  }
  return 'development';
};

const NODE_ENV = getNodeEnv();
// Forçar desenvolvimento se estiver rodando localmente
const isProduction = NODE_ENV === 'production' && typeof window === 'undefined' && process.env.FRONTEND_URL;
const isDevelopment = !isProduction;
const isServer = typeof window === 'undefined';

// URLs otimizadas para cada ambiente
const getBaseUrls = () => {
  // FORÇAR LOCALHOST PARA EVITAR LOOP INFINITO
  // Sempre usar localhost para desenvolvimento local
  console.log('🔧 [ENV] Forçando configuração de localhost para evitar loop infinito');
  
  const frontendUrl = 'http://localhost:3000';
  const backendUrl = 'http://localhost:3001';
  
  return {
    FRONTEND_URL: frontendUrl,
    BACKEND_URL: backendUrl,
    API_BASE_URL: backendUrl,
    INTERNAL_API_URL: backendUrl
  };
};

// Inicializar URLs de forma segura
let BASE_URLS: ReturnType<typeof getBaseUrls>;
try {
  BASE_URLS = getBaseUrls();
} catch (error) {
  console.warn('Erro ao inicializar URLs base, usando fallback:', error);
  BASE_URLS = {
    FRONTEND_URL: 'http://localhost:3000',
    BACKEND_URL: 'http://localhost:3001',
    API_BASE_URL: 'http://localhost:3001',
    INTERNAL_API_URL: 'http://localhost:3001'
  };
}

export const ENV_CONFIG = {
  // Ambiente
  NODE_ENV,
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: isDevelopment,
  IS_SERVER: isServer,
  
  // URLs
  ...BASE_URLS,
  
  // Configurações de API
  API_TIMEOUT: 30000,
  API_RETRY_ATTEMPTS: 2,
  
  // CORS
  CORS_ORIGINS: isDevelopment 
    ? ['http://localhost:3000', 'http://localhost:3001']
    : ['https://portal.sabercon.com.br'],
    
  // Configurações de segurança
  SECURE_COOKIES: isProduction,
  SAME_SITE: isProduction ? 'strict' as const : 'lax' as const,
  
  // Cache
  CACHE_ENABLED: true,
  CACHE_TTL: isProduction ? 1800 : 300, // 30min prod, 5min dev
  
  // Debug
  DEBUG_MODE: isDevelopment
} as const;

// Função helper para obter URL da API (cliente/browser)
export const getApiUrl = (path: string = '') => {
  try {
    const baseUrl = ENV_CONFIG.API_BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Se a baseUrl já termina com /api e o path começa com /api, evitar duplicação
    if (baseUrl.endsWith('/api') && cleanPath.startsWith('/api')) {
      return `${baseUrl}${cleanPath.substring(4)}`;
    }
    
    return `${baseUrl}${cleanPath}`;
  } catch (error) {
    console.warn('Erro ao obter API URL, usando fallback:', error);
    return `http://localhost:3001${path.startsWith('/') ? path : `/${path}`}`;
  }
};

// Função helper para obter URL interna (servidor/SSR)
export const getInternalApiUrl = (path: string = '') => {
  try {
    const baseUrl = ENV_CONFIG.INTERNAL_API_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Se a baseUrl já termina com /api e o path começa com /api, evitar duplicação
    if (baseUrl.endsWith('/api') && cleanPath.startsWith('/api')) {
      return `${baseUrl}${cleanPath.substring(4)}`;
    }
    
    return `${baseUrl}${cleanPath}`;
  } catch (error) {
    console.warn('Erro ao obter Internal API URL, usando fallback:', error);
    return `http://localhost:3001${path.startsWith('/') ? path : `/${path}`}`;
  }
};

// Função helper para log de configuração (apenas em desenvolvimento)
export const logEnvironmentConfig = () => {
  if (typeof console !== 'undefined' && ENV_CONFIG.DEBUG_MODE) {
    console.log('🚀 Configuração de Ambiente:');
    console.log(`   NODE_ENV: ${ENV_CONFIG.NODE_ENV}`);
    console.log(`   FRONTEND_URL: ${ENV_CONFIG.FRONTEND_URL}`);
    console.log(`   API_BASE_URL: ${ENV_CONFIG.API_BASE_URL}`);
  }
};

export default ENV_CONFIG;