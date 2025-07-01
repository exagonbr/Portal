/**
 * 🔐 CONFIGURAÇÃO JWT UNIFICADA
 * 
 * ✅ Um único secret compartilhado
 * ✅ Tokens padrão JWT (sem fallback base64)
 * ✅ Access token: 1 hora | Refresh token: 7 dias
 * ✅ Algoritmo HS256 em todo lugar
 */

export const JWT_CONFIG = {
  // Secret único para toda a aplicação
  SECRET: process.env.JWT_SECRET || 'portal_sabercon_jwt_secret_2025',
  
  // Algoritmo de assinatura
  ALGORITHM: 'HS256' as const,
  
  // Tempos de expiração
  ACCESS_TOKEN_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  
  // Issuer da aplicação
  ISSUER: 'portal.sabercon.com.br',
  
  // Audience
  AUDIENCE: 'portal-users'
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
  type?: 'access';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Interface para payload do Refresh Token
export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
  type: 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

// Validar configuração JWT
export function validateJWTConfig(): void {
  if (!JWT_CONFIG.SECRET) {
    throw new Error('JWT_SECRET não está configurado nas variáveis de ambiente');
  }
  
  if (JWT_CONFIG.SECRET.length < 32) {
    console.warn('⚠️ JWT_SECRET deve ter pelo menos 32 caracteres para maior segurança');
  }
  
  console.log('✅ Configuração JWT validada:', {
    algorithm: JWT_CONFIG.ALGORITHM,
    accessTokenExpires: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpires: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE,
    secretLength: JWT_CONFIG.SECRET.length
  });
}

// Função para compatibilidade com código existente
export function getJwtSecret(): string {
  return JWT_CONFIG.SECRET;
}