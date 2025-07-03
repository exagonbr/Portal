/**
 * Configuração JWT Centralizada - HARDCODED para Produção
 * Secrets consistentes entre frontend e backend
 */

// JWT Secrets hardcoded - MESMOS para frontend e backend
export const JWT_CONFIG = {
  // Secret principal para assinatura de tokens
  JWT_SECRET: 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789',
  
  // Secret para NextAuth (compatibilidade)
  NEXTAUTH_SECRET: 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789',
  
  // Configurações de token
  TOKEN_EXPIRY: '7d', // 7 dias
  REFRESH_TOKEN_EXPIRY: '30d', // 30 dias
  
  // Algoritmo de assinatura
  ALGORITHM: 'HS256' as const,
  
  // Issuer e audience
  ISSUER: 'portal.sabercon.com.br',
  AUDIENCE: 'portal.sabercon.com.br',
  
  // Headers padrão
  HEADERS: {
    typ: 'JWT',
    alg: 'HS256'
  }
} as const;

// Função para validar se o secret está correto
export const validateJwtSecret = (secret?: string): boolean => {
  return secret === JWT_CONFIG.JWT_SECRET;
};

// Função para obter o secret (sempre retorna o hardcoded)
export const getJwtSecret = (): string => {
  return JWT_CONFIG.JWT_SECRET;
};

// Função para obter configurações completas do JWT
export const getJwtConfig = () => {
  return {
    secret: JWT_CONFIG.JWT_SECRET,
    expiresIn: JWT_CONFIG.TOKEN_EXPIRY,
    algorithm: JWT_CONFIG.ALGORITHM,
    issuer: JWT_CONFIG.ISSUER,
    audience: JWT_CONFIG.AUDIENCE
  };
};

// Log de inicialização (apenas em desenvolvimento)
if (typeof console !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔐 [JWT-CONFIG] Configuração JWT inicializada:');
  console.log(`   Secret Length: ${JWT_CONFIG.JWT_SECRET.length} chars`);
  console.log(`   Token Expiry: ${JWT_CONFIG.TOKEN_EXPIRY}`);
  console.log(`   Algorithm: ${JWT_CONFIG.ALGORITHM}`);
  console.log(`   Issuer: ${JWT_CONFIG.ISSUER}`);
}

export default JWT_CONFIG;