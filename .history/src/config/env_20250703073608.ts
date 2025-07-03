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
const isDevelopment = NODE_ENV === 'development';
const isServer = typeof window === 'undefined';

// URLs otimizadas para cada ambiente
const getBaseUrls = () => {
  // Em desenvolvimento, usar URLs locais
  if (isDevelopment) {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return {
      FRONTEND_URL: frontendUrl,
      BACKEND_URL: backendUrl,
      API_BASE_URL: backendUrl,
      INTERNAL_API_URL: backendUrl
    };
  }
  
  // Em produção, usar URLs de produção
  const frontendUrl = process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';
  
  return {
    FRONTEND_URL: frontendUrl,
    // Em produção, o backend está no mesmo domínio sob /api
    BACKEND_URL: `${frontendUrl}/api`,
    API_BASE_URL: `${frontendUrl}/api`,
    INTERNAL_API_URL: `${frontendUrl}/api`
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

export const getApiUrl = (path: string = '') => {
  try {
    const baseUrl = ENV_CONFIG.API_BASE_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  } catch (error) {
    console.warn('Erro ao obter API URL, usando fallback:', error);
    const fallbackUrl = process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';
    return `${fallbackUrl}/api${path.startsWith('/') ? path : `/${path}`}`;
  }
};

// Função helper para obter URL interna (servidor/SSR)
export const getInternalApiUrl = (path: string = '') => {
  try {
    const baseUrl = ENV_CONFIG.INTERNAL_API_URL;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  } catch (error) {
    console.warn('Erro ao obter Internal API URL, usando fallback:', error);
    const fallbackUrl = process.env.FRONTEND_URL || 'https://portal.sabercon.com.br';
    return `${fallbackUrl}/api${path.startsWith('/') ? path : `/${path}`}`;
  }
};

// Função helper para log de configuração (apenas em desenvolvimento)
export const logEnvironmentConfig = () => {
  if (typeof console !== 'undefined' && ENV_CONFIG.DEBUG_MODE) {
    console.log('🚀 Configuração Otimizada (Comunicação Direta):');
    console.log(`   NODE_ENV: ${ENV_CONFIG.NODE_ENV}`);
    console.log(`   FRONTEND_URL: ${ENV_CONFIG.FRONTEND_URL}`);
    console.log(`   API_BASE_URL (Cliente): ${ENV_CONFIG.API_BASE_URL}`);
    console.log(`   INTERNAL_API_URL (Servidor): ${ENV_CONFIG.INTERNAL_API_URL}`);
    console.log(`   🔥 Proxy Next.js: DESABILITADO`);
    console.log(`   ⚡ Comunicação: DIRETA via Nginx`);
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