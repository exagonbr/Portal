/**
 * Utilitário para validação de tokens de autenticação
 */

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload?: any;
  error?: string;
}

/**
 * Valida um token JWT
 */
export function validateToken(token: string): TokenValidationResult {
  if (!token) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Token não fornecido'
    };
  }

  try {
    // Decodificar o token JWT (sem verificar assinatura)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        isValid: false,
        isExpired: false,
        error: 'Formato de token inválido'
      };
    }

    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Verificar se o token expirou
    const isExpired = payload.exp && payload.exp < now;
    
    return {
      isValid: !isExpired,
      isExpired,
      payload,
      error: isExpired ? 'Token expirado' : undefined
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Erro ao decodificar token'
    };
  }
}

/**
 * Obtém o token do localStorage e valida
 */
export function getAndValidateToken(): TokenValidationResult {
  if (typeof window === 'undefined') {
    return {
      isValid: false,
      isExpired: false,
      error: 'Ambiente servidor - localStorage não disponível'
    };
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    return {
      isValid: false,
      isExpired: false,
      error: 'Token não encontrado no localStorage'
    };
  }

  return validateToken(token);
}

/**
 * Verifica se o usuário está autenticado com token válido
 */
export function isAuthenticated(): boolean {
  const result = getAndValidateToken();
  return result.isValid;
}