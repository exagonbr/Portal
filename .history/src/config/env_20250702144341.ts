/**
 * Configuração centralizada de ambiente - OTIMIZADA
 * Comunicação direta frontend-backend sem proxy
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

// URLs otimizadas para comunicação direta
const getBaseUrls = () => {
  if (isProduction) {
    return {
      // Frontend público
      FRONTEND_URL: 'https://portal.sabercon.com.br',
      
      // Backend - comunicação direta via Nginx (sem proxy Next.js)
      // Cliente (browser): usa URL pública do Nginx
      BACKEND_URL: 'https://portal.sabercon.com.br/api',
      API_BASE_URL: 'https://portal.sabercon.com.br/api',
      
      // Servidor (SSR): usa URL interna direta
      INTERNAL_API_URL: 'https://portal.sabercon.com.br/api'
    };
  }
  
  // Desenvolvimento - usar backend local
  return {
    FRONTEND_URL: 'https://portal.sabercon.com.br/',
    BACKEND_URL: 'https://portal.sabercon.com.br/api',
    API_BASE_URL: 'https://portal.sabercon.com.br/api',
    INTERNAL_API_URL: 'https://portal.sabercon.com.br/api'
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
  
  // Configurações de API otimizadas
  API_TIMEOUT: 30000,
  API_RETRY_ATTEMPTS: 2, // Reduzido para evitar sobrecarga
  
  // CORS simplificado
  CORS_ORIGINS: ['https://portal.sabercon.com.br'],
    
  // Configurações de segurança
  SECURE_COOKIES: isProduction,
  SAME_SITE: isProduction ? 'strict' as const : 'lax' as const,
  
  // Cache otimizado
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
    return `${baseUrl}${cleanPath}`;
  } catch (error) {
    console.warn('Erro ao obter API URL, usando fallback:', error);
    return `https://portal.sabercon.com.br/api${path.startsWith('/') ? path : `/${path}`}`;
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
    return `https://portal.sabercon.com.br/api${path.startsWith('/') ? path : `/${path}`}`;
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