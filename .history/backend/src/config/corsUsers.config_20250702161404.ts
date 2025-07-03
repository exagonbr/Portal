/**
 * Configurações centralizadas de CORS para APIs de usuários
 * Este arquivo permite fácil manutenção e configuração das políticas de CORS
 */

export interface CorsUsersConfig {
  allowedOrigins: string[];
  adminOrigins: string[];
  publicOrigins: string[];
  developmentMode: boolean;
  maxAge: number;
}

/**
 * Configuração padrão de CORS para usuários
 */
export const corsUsersConfig: CorsUsersConfig = {
  // Origens permitidas para APIs gerais de usuários
  allowedOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://portal.sabercon.com.br',
    'https://portal.sabercon.com.br/api',
    'http://localhost:8080',
    'http://localhost:4200', // Angular dev server
    'http://localhost:5173', // Vite dev server
    'https://app.sabercon.com.br',
    'https://admin.sabercon.com.br',
    'https://www.sabercon.com.br',
    // Adicionar origens do arquivo .env se existirem
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [])
  ],

  // Origens permitidas apenas para operações administrativas
  adminOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://portal.sabercon.com.br',
    'https://portal.sabercon.com.br/api',
    ...(process.env.ADMIN_ORIGINS ? process.env.ADMIN_ORIGINS.split(',').map(o => o.trim()) : [])
  ],

  // Origens permitidas para endpoints públicos (sem autenticação)
  publicOrigins: [
    '*' // Permitir todas as origens para endpoints públicos
  ],

  // Modo de desenvolvimento (mais permissivo)
  developmentMode: process.env.NODE_ENV === 'development',

  // Cache de preflight em segundos (24 horas)
  maxAge: 86400
};

/**
 * Headers permitidos para requisições de usuários
 */
export const allowedHeaders = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'Cache-Control',
  'X-CSRF-Token',
  'X-User-Agent',
  'X-API-Key',
  'X-Client-Version',
  'X-Device-ID'
];

/**
 * Headers expostos nas respostas
 */
export const exposedHeaders = [
  'X-Total-Count',
  'X-Page-Count',
  'X-Response-Time',
  'X-Rate-Limit-Remaining',
  'X-Rate-Limit-Reset',
  'Set-Cookie'
];

/**
 * Métodos HTTP permitidos
 */
export const allowedMethods = [
  'GET',
  'POST', 
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'HEAD'
];

/**
 * Função para verificar se uma origem é permitida
 */
export function isOriginAllowed(origin: string | undefined, allowedList: string[]): boolean {
  // Permitir requisições sem 'Origin' (ex: mobile apps, Postman, server-to-server)
  // ou com origem "unknown" que pode ocorrer em certos cenários (iframes, etc.)
  if (!origin || origin === 'unknown') {
    return true;
  }

  // Em desenvolvimento, permitir qualquer localhost
  if (corsUsersConfig.developmentMode && origin.includes('localhost')) {
    return true;
  }

  // Verificar se a origem está na lista permitida
  return allowedList.includes(origin) || allowedList.includes('*');
}

/**
 * Função para obter configuração de CORS baseada no tipo de endpoint
 */
export function getCorsConfigByType(type: 'general' | 'admin' | 'public') {
  switch (type) {
    case 'admin':
      return {
        origins: corsUsersConfig.adminOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
      };
    case 'public':
      return {
        origins: corsUsersConfig.publicOrigins,
        credentials: false,
        methods: ['GET', 'OPTIONS']
      };
    case 'general':
    default:
      return {
        origins: corsUsersConfig.allowedOrigins,
        credentials: true,
        methods: allowedMethods
      };
  }
}

export default corsUsersConfig;
