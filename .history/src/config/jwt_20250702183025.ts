/**
 * Configuração JWT Centralizada - ÚNICA FONTE DE VERDADE
 * Compartilhada entre Frontend e Backend
 */

export const JWT_CONFIG = {
  // Secret único para toda aplicação
  JWT_SECRET: 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789',
  SECRET: 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789', // Alias para compatibilidade
  
  // Tempos de expiração
  TOKEN_EXPIRY: '1h',        // Access token: 1 hora
  REFRESH_TOKEN_EXPIRY: '7d', // Refresh token: 7 dias
  ACCESS_TOKEN_EXPIRES_IN: '1h', // Alias para compatibilidade
  
  // Algoritmo padrão
  ALGORITHM: 'HS256' as const,
  
  // Issuer e audience
  ISSUER: 'localhost',
  AUDIENCE: 'localhost',
} as const;

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
  return JWT_CONFIG.JWT_SECRET;
};

// Função helper para obter configurações
export const getJwtConfig = () => {
  return {
    secret: JWT_CONFIG.JWT_SECRET,
    expiresIn: JWT_CONFIG.TOKEN_EXPIRY,
    algorithm: JWT_CONFIG.ALGORITHM,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE
  };
};

export default JWT_CONFIG;