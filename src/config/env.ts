/**
 * Configuração centralizada de ambiente
 * Resolve URLs baseado no ambiente atual
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
const isDevelopment = NODE_ENV === 'development';

// URLs base baseadas no ambiente
const getBaseUrls = () => {
  if (isProduction) {
    return {
      FRONTEND_URL: 'https://portal.sabercon.com.br',
      BACKEND_URL: 'https://portal.sabercon.com.br/api',
      API_BASE_URL: '/api', // Usar URL relativa em produção
      INTERNAL_API_URL: (typeof process !== 'undefined' && process.env?.INTERNAL_API_URL) || 'http://127.0.0.1:3001'
    };
  }
  
  // Desenvolvimento
  const nextPublicApiUrl = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'https://portal.sabercon.com.br/api';
  const nextAuthUrl = (typeof process !== 'undefined' && process.env?.NEXTAUTH_URL) || 'https://portal.sabercon.com.br';
  const internalApiUrl = (typeof process !== 'undefined' && process.env?.INTERNAL_API_URL) || 'https://portal.sabercon.com.br/api';
  
  return {
    FRONTEND_URL: nextAuthUrl,
    BACKEND_URL: nextPublicApiUrl,
    API_BASE_URL: nextPublicApiUrl,
    INTERNAL_API_URL: internalApiUrl
  };
};

// Inicializar URLs de forma segura
let BASE_URLS: ReturnType<typeof getBaseUrls>;
try {
  BASE_URLS = getBaseUrls();
} catch (error) {
  console.warn('Erro ao inicializar URLs base, usando fallback:', error);
  BASE_URLS = {
    FRONTEND_URL: 'https://portal.sabercon.com.br',
    BACKEND_URL: 'https://portal.sabercon.com.br/api',
    API_BASE_URL: 'https://portal.sabercon.com.br/api',
    INTERNAL_API_URL: 'https://portal.sabercon.com.br/api'
  };
}

export const ENV_CONFIG = {
  // Ambiente
  NODE_ENV,
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: isDevelopment,
  
  // URLs
  ...BASE_URLS,
  
  // Configurações de API
  API_TIMEOUT: 30000,
  API_RETRY_ATTEMPTS: 3,
  
  // Configurações de CORS
  CORS_ORIGINS: isProduction 
    ? ['https://portal.sabercon.com.br', 'https://www.portal.sabercon.com.br']
    : ['http://localhost:3000', 'http://localhost:3001'],
    
  // Configurações de segurança
  SECURE_COOKIES: isProduction,
  SAME_SITE: isProduction ? 'strict' as const : 'lax' as const,
  
  // Configurações de cache
  CACHE_ENABLED: true,
  CACHE_TTL: isProduction ? 3600 : 300,
  
  // Debug
  DEBUG_MODE: isDevelopment
} as const;

// Função helper para obter URL da API
export const getApiUrl = (path: string = '') => {
  try {
    const baseUrl = ENV_CONFIG.API_BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  } catch (error) {
    console.warn('Erro ao obter API URL, usando fallback:', error);
    return `https://portal.sabercon.com.br/api${path.startsWith('/') ? path : `/${path}`}`;
  }
};

// Função helper para obter URL interna (backend)
export const getInternalApiUrl = (path: string = '') => {
  try {
    const baseUrl = ENV_CONFIG.INTERNAL_API_URL;
    let cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Se o baseUrl já termina com /api e o path começa com /api, remover duplicação
    if (baseUrl.endsWith('/api') && cleanPath.startsWith('/api')) {
      cleanPath = cleanPath.substring(4); // Remove '/api' do início
    }
    
    return `${baseUrl}${cleanPath}`;
  } catch (error) {
    console.warn('Erro ao obter Internal API URL, usando fallback:', error);
    const fallbackUrl = 'https://portal.sabercon.com.br';
    let cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Evitar duplicação de /api no fallback também
    if (cleanPath.startsWith('/api/api')) {
      cleanPath = cleanPath.substring(4); // Remove primeiro '/api'
    }
    
    return `${fallbackUrl}${cleanPath}`;
  }
};

// Função helper para log de configuração (apenas em desenvolvimento)
export const logEnvironmentConfig = () => {
  if (typeof console !== 'undefined' && ENV_CONFIG.DEBUG_MODE) {
    console.log('🔧 Configuração de Ambiente:');
    console.log(`   NODE_ENV: ${ENV_CONFIG.NODE_ENV}`);
    console.log(`   FRONTEND_URL: ${ENV_CONFIG.FRONTEND_URL}`);
    console.log(`   BACKEND_URL: ${ENV_CONFIG.BACKEND_URL}`);
    console.log(`   API_BASE_URL: ${ENV_CONFIG.API_BASE_URL}`);
    console.log(`   INTERNAL_API_URL: ${ENV_CONFIG.INTERNAL_API_URL}`);
    console.log(`   SECURE_COOKIES: ${ENV_CONFIG.SECURE_COOKIES}`);
    console.log(`   CORS_ORIGINS: ${ENV_CONFIG.CORS_ORIGINS.join(', ')}`);
  }
};

// Exportar URLs para compatibilidade
export const {
  FRONTEND_URL,
  BACKEND_URL,
  API_BASE_URL,
  INTERNAL_API_URL
} = BASE_URLS;

export default ENV_CONFIG; 