/**
 * Configuração centralizada de ambiente
 * Resolve URLs baseado no ambiente atual
 */

// Detectar ambiente
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// URLs base baseadas no ambiente
const getBaseUrls = () => {
  if (isProduction) {
    return {
      FRONTEND_URL: 'https://portal.sabercon.com.br',
      BACKEND_URL: 'https://portal.sabercon.com.br/api',
      API_BASE_URL: '/api', // Usar URL relativa em produção
      INTERNAL_API_URL: process.env.INTERNAL_API_URL || 'http://127.0.0.1:3001'
    };
  }
  
  // Desenvolvimento
  return {
    FRONTEND_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    BACKEND_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    INTERNAL_API_URL: process.env.INTERNAL_API_URL || 'http://localhost:3001'
  };
};

const BASE_URLS = getBaseUrls();

export const ENV_CONFIG = {
  // Ambiente
  NODE_ENV: process.env.NODE_ENV || 'development',
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
  SAME_SITE: isProduction ? 'strict' : 'lax',
  
  // Configurações de cache
  CACHE_ENABLED: true,
  CACHE_TTL: isProduction ? 3600 : 300,
  
  // Debug
  DEBUG_MODE: isDevelopment
} as const;

// Função helper para obter URL da API
export const getApiUrl = (path: string = '') => {
  const baseUrl = ENV_CONFIG.API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Função helper para obter URL interna (backend)
export const getInternalApiUrl = (path: string = '') => {
  const baseUrl = ENV_CONFIG.INTERNAL_API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Função helper para log de configuração
export const logEnvironmentConfig = () => {
  console.log('🔧 Configuração de Ambiente:');
  console.log(`   NODE_ENV: ${ENV_CONFIG.NODE_ENV}`);
  console.log(`   FRONTEND_URL: ${ENV_CONFIG.FRONTEND_URL}`);
  console.log(`   BACKEND_URL: ${ENV_CONFIG.BACKEND_URL}`);
  console.log(`   API_BASE_URL: ${ENV_CONFIG.API_BASE_URL}`);
  console.log(`   INTERNAL_API_URL: ${ENV_CONFIG.INTERNAL_API_URL}`);
  console.log(`   SECURE_COOKIES: ${ENV_CONFIG.SECURE_COOKIES}`);
  console.log(`   CORS_ORIGINS: ${ENV_CONFIG.CORS_ORIGINS.join(', ')}`);
};

// Exportar URLs para compatibilidade
export const {
  FRONTEND_URL,
  BACKEND_URL,
  API_BASE_URL,
  INTERNAL_API_URL
} = BASE_URLS;

export default ENV_CONFIG; 