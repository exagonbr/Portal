/**
 * 🔐 CONFIGURAÇÃO JWT UNIFICADA
 * 
 * ✅ Um único secret compartilhado
 * ✅ Tokens padrão JWT (sem fallback base64)
 * ✅ Access token: 1 hora | Refresh token: 7 dias
 * ✅ Algoritmo HS256 em todo lugar
 */

import type { SignOptions } from 'jsonwebtoken';

export const JWT_CONFIG: {
  SECRET: string | undefined;
  ALGORITHM: 'HS256';
  ACCESS_TOKEN_EXPIRES_IN: SignOptions['expiresIn'];
  REFRESH_TOKEN_EXPIRES_IN: SignOptions['expiresIn'];
  ISSUER: string;
  AUDIENCE: string;
} = {
  // Secret único para toda a aplicação
  SECRET: 'super_secret_nextauth_key_for_production_portal_sabercon_2025',

  // Algoritmo de assinatura
  ALGORITHM: 'HS256',

  // Tempos de expiração
  ACCESS_TOKEN_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',

  // Issuer da aplicação
  ISSUER: process.env.FRONTEND_URL?.replace('https://', '').replace('http://', '') || 'portal.sabercon.com.br',

  // Audience
  AUDIENCE: 'portal-users'
};

// Interface para payload do Access Token
export interface AccessTokenPayload {
  id: string;
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
  id: string;
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
  if (!JWT_CONFIG.SECRET) {
    throw new Error('JWT_SECRET não está configurado nas variáveis de ambiente');
  }
  return JWT_CONFIG.SECRET;
}
