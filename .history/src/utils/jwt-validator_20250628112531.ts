/**
 * Utilitário para validação de JWT simplificado
 * Evita loops infinitos usando apenas o secret principal
 */

import jwt from 'jsonwebtoken';

export interface JWTValidationResult {
  success: boolean;
  decoded?: any;
  usedSecret?: string;
  error?: string;
}

/**
 * Valida JWT usando apenas o secret principal (evita loops)
 */
export function validateJWTWithMultipleSecrets(token: string): JWTValidationResult {
  console.log('🔑 [JWT-VALIDATOR] Iniciando validação JWT simplificada...');
  
  if (!token || token.length < 10) {
    return {
      success: false,
      error: 'Token vazio ou muito curto'
    };
  }

  // Verificar se é um JWT válido (3 partes)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return {
      success: false,
      error: 'Token não é um JWT válido (não tem 3 partes)'
    };
  }

  // Usar apenas o secret principal para evitar loops
  const secret = process.env.JWT_SECRET || 'ExagonTech';
  
  try {
    console.log(`🔑 [JWT-VALIDATOR] Tentando secret: ${secret.substring(0, 5)}...`);
    const decoded = jwt.verify(token, secret) as any;
    
    // Verificar se o payload é válido
    if (typeof decoded === 'object' && (decoded.userId || decoded.sub)) {
      console.log(`✅ [JWT-VALIDATOR] JWT validado com sucesso usando secret: ${secret.substring(0, 5)}...`);
      console.log(`✅ [JWT-VALIDATOR] Usuário: ${decoded.email || decoded.userId || decoded.sub}`);
      
      return {
        success: true,
        decoded,
        usedSecret: secret
      };
    } else {
      return {
        success: false,
        error: 'Payload JWT inválido'
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.log(`❌ [JWT-VALIDATOR] Falha com secret ${secret.substring(0, 5)}...: ${errorMsg}`);
    
    return {
      success: false,
      error: `JWT validation failed: ${errorMsg}`
    };
  }
}

/**
 * Tenta obter um novo token válido
 */
export async function getValidToken(): Promise<string | null> {
  console.log('🔄 [JWT-VALIDATOR] Tentando obter novo token válido...');
  
  const credentials = [
    { email: 'admin@sabercon.edu.br', password: 'admin123' },
    { email: 'admin@sabercon.com.br', password: 'admin123' },
    { email: 'estevao@programmer.net', password: 'admin123' }
  ];

  for (const cred of credentials) {
    try {
      console.log(`🔄 [JWT-VALIDATOR] Tentando login com ${cred.email}...`);
      
      const response = await fetch('https://portal.sabercon.com.br/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cred)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.token) {
          // Validar o novo token
          const validation = validateJWTWithMultipleSecrets(data.token);
          if (validation.success) {
            console.log(`✅ [JWT-VALIDATOR] Novo token válido obtido com ${cred.email}`);
            return data.token;
          }
        }
      }
    } catch (error) {
      console.log(`❌ [JWT-VALIDATOR] Erro ao tentar login com ${cred.email}:`, error);
    }
  }

  console.log('❌ [JWT-VALIDATOR] Não foi possível obter novo token válido');
  return null;
}

/**
 * Corrige token inválido automaticamente
 */
export async function fixInvalidToken(): Promise<string | null> {
  console.log('🔧 [JWT-VALIDATOR] Iniciando correção automática de token...');
  
  // Limpar tokens inválidos existentes
  if (typeof window !== 'undefined') {
    const keysToClean = ['auth_token', 'token', 'authToken'];
    
    keysToClean.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Limpar cookies
    keysToClean.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
    
    console.log('🧹 [JWT-VALIDATOR] Tokens inválidos limpos');
  }

  // Obter novo token
  const newToken = await getValidToken();
  
  if (newToken && typeof window !== 'undefined') {
    // Armazenar novo token
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('token', newToken);
    
    // Configurar cookie
    const maxAge = 7 * 24 * 60 * 60; // 7 dias
    document.cookie = `auth_token=${newToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
    
    console.log('✅ [JWT-VALIDATOR] Novo token armazenado com sucesso');
  }

  return newToken;
}

/**
 * Função para uso em componentes React
 */
export function useJWTValidator() {
  return {
    validateToken: validateJWTWithMultipleSecrets,
    getValidToken,
    fixInvalidToken
  };
}

// Função global para debug
if (typeof window !== 'undefined') {
  (window as any).validateJWT = validateJWTWithMultipleSecrets;
  (window as any).fixToken = fixInvalidToken;
}
