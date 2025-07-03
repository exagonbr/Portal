/**
 * Configuração JWT Centralizada - ÚNICA FONTE DE VERDADE
 * Compartilhada entre Frontend e Backend
 */

export interface AccessTokenPayload {
  id: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key',
  ACCESS_TOKEN_EXPIRATION: process.env.JWT_ACCESS_TOKEN_EXPIRATION || '1h',
  REFRESH_TOKEN_EXPIRATION: process.env.JWT_REFRESH_TOKEN_EXPIRATION || '7d'
};

// Interface para payload do Access Token
export interface AccessTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId?: string;
  sessionId: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

// Interface para payload do Refresh Token
export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

// Função helper para obter o secret
export const getJwtSecret = (): string => {
  return JWT_CONFIG.SECRET;
};

// Função helper para obter configurações
export const getJwtConfig = () => {
  return {
    secret: JWT_CONFIG.SECRET,
    expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRATION,
    algorithm: 'HS256' as const,
    issuer: 'portal.sabercon.com.br',
    audience: 'portal.sabercon.com.br'
  };
};

export default JWT_CONFIG;