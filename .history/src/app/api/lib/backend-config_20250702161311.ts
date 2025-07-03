/**
 * Configuração centralizada para URLs do backend
 * Força o uso das URLs configuradas no .env
 */

// Forçar leitura das variáveis de ambiente
const FORCE_PRODUCTION_BACKEND = process.env.FORCE_PRODUCTION_BACKEND === 'true';

// URLs do backend - priorizar valores do .env
export const BACKEND_CONFIG = {
  // URL principal do backend
  url: process.env.BACKEND_URL || process.env.INTERNAL_API_URL || 'http://localhost:3001',
  
  // URL pública da API
  publicUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // Forçar uso do backend de produção mesmo com servidor local
  forceProduction: FORCE_PRODUCTION_BACKEND,
  
  // Timeout padrão
  timeout: 30000,
  
  // Headers padrão
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

/**
 * Obter URL do backend com path
 */
export function getBackendUrl(path: string = ''): string {
  const baseUrl = BACKEND_CONFIG.url;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Remover /api duplicado se existir
  const url = baseUrl.endsWith('/api') && cleanPath.startsWith('/api') 
    ? baseUrl + cleanPath.substring(4)
    : baseUrl + cleanPath;
    
  console.log(`🔗 Backend URL: ${url}`);
  return url;
}

/**
 * Verificar se deve usar backend local
 */
export function shouldUseLocalBackend(): boolean {
  // Se forçar produção, sempre retornar false
  if (BACKEND_CONFIG.forceProduction) {
    return false;
  }
  
  // Em produção, nunca usar local
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // Verificar se há um backend local configurado explicitamente
  const localUrls = ['https://portal.sabercon.com.br/api'];
  return localUrls.some(url => 
    process.env.BACKEND_URL?.includes(url) || 
    process.env.INTERNAL_API_URL?.includes(url)
  );
}

// Log da configuração atual
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Backend Configuration:', {
    url: BACKEND_CONFIG.url,
    publicUrl: BACKEND_CONFIG.publicUrl,
    forceProduction: BACKEND_CONFIG.forceProduction,
    usingLocal: shouldUseLocalBackend()
  });
}
