/**
 * Utilitário para verificar o ambiente de forma segura no cliente e servidor
 */

// Função para verificar se estamos no lado do cliente
export const isClient = typeof window !== 'undefined';

// Função para verificar se estamos no lado do servidor
export const isServer = typeof window === 'undefined';

// Função para obter o NODE_ENV de forma segura
export const getNodeEnv = (): string => {
  // No servidor, usar process.env.NODE_ENV
  if (isServer) {
    return process.env.NODE_ENV || 'development';
  }
  
  // No cliente, usar a variável pública ou detectar pelo hostname
  if (isClient) {
    // Primeiro, tentar usar a variável pública se disponível
    if (process.env.NEXT_PUBLIC_NODE_ENV) {
      return process.env.NEXT_PUBLIC_NODE_ENV;
    }
    
    // Fallback: detectar pelo hostname
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev')) {
      return 'development';
    }
    
    return 'production';
  }
  
  return 'development';
};

// Função para verificar se estamos em desenvolvimento
export const isDevelopment = (): boolean => {
  return getNodeEnv() === 'development';
};

// Função para verificar se estamos em produção
export const isProduction = (): boolean => {
  return getNodeEnv() === 'production';
};

// Função para verificar se estamos em teste
export const isTest = (): boolean => {
  return getNodeEnv() === 'test';
};

// Exportar constantes para uso direto
export const NODE_ENV = getNodeEnv();
export const IS_DEVELOPMENT = isDevelopment();
export const IS_PRODUCTION = isProduction();
export const IS_TEST = isTest();
export const IS_CLIENT = isClient;
export const IS_SERVER = isServer;