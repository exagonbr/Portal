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
const isProduction = NODE_ENV === 'production';
const isDevelopment = !isProduction;
const isServer = typeof window === 'undefined';

// URLs otimizadas para cada ambiente
const getBaseUrls = () => {
  // CORREÇÃO: Usar configuração baseada apenas no NODE_ENV, não no isServer
  if (isProduction) {
    console.log('🌐 [ENV] Usando configuração de produção');
    
    return {
      FRONTEND_URL: 'https://portal.sabercon.com.br',
      BACKEND_URL: 'https://portal.sabercon.com.br/api',
      API_BASE_URL: 'https://portal.sabercon.com.br/api',
      INTERNAL_API_URL: 'https://portal.sabercon.com.br/api'
    };
  }

  const API_URL = process.env.BACKEND_URL;
  
  // Para desenvolvimento local (tanto servidor quanto browser)
  console.log('💻 [ENV] Usando configuração de desenvolvimento local');
  console.log('💻 [ENV] ', API_URL);

  
  // Verificar se temos variáveis de ambiente específicas
  const backendUrl = (typeof process !== 'undefined' && process.env.BACKEND_URL) || 'http://localhost:3001/api';
  const frontendUrl = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) || 'http://localhost:3000';
  
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
  
  // Em caso de erro, usar URLs de desenvolvimento como fallback em desenvolvimento
  if (isDevelopment) {
    BASE_URLS = {
      FRONTEND_URL: 'http://localhost:3000',
      BACKEND_URL: 'http://localhost:3001/api',
      API_BASE_URL: 'http://localhost:3001/api',
      INTERNAL_API_URL: 'http://localhost:3001/api'
    };
  } else {
    // Fallback de produção
    BASE_URLS = {
      FRONTEND_URL: 'https://portal.sabercon.com.br',
      BACKEND_URL: 'https://portal.sabercon.com.br/api',
      API_BASE_URL: 'https://portal.sabercon.com.br/api',
      INTERNAL_API_URL: 'https://portal.sabercon.com.br/api'
    };
  }
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
    
    // Fallback para URLs de produção
    const fallbackUrl = `https://portal.sabercon.com.br/api${path.startsWith('/') ? path : `/${path}`}`;
    console.log('🔄 Usando fallback URL:', fallbackUrl);
    return fallbackUrl;
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
    
    // Fallback para URLs de produção
    const fallbackUrl = `https://portal.sabercon.com.br/api${path.startsWith('/') ? path : `/${path}`}`;
    console.log('🔄 Usando fallback Internal URL:', fallbackUrl);
    return fallbackUrl;
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