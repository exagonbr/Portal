/**
 * Utilitário para limpar tokens inválidos do localStorage
 */

export const cleanupInvalidTokens = (): void => {
  if (typeof window === 'undefined') return;

  const tokenKeys = [
    'accessToken',
    'auth_token',
    'token',
    'authToken',
    'jwt_token'
  ];

  tokenKeys.forEach(key => {
    try {
      const token = localStorage.getItem(key);
      if (token && isInvalidToken(token)) {
        console.log(`Removendo token inválido: ${key}`);
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erro ao verificar token ${key}:`, error);
    }
  });
};

const isInvalidToken = (token: string): boolean => {
  // Verificar se é null/undefined como string
  if (token === 'null' || token === 'undefined' || token === 'false' || token === 'true') {
    return true;
  }

  // Verificar se é muito curto
  if (token.length < 10) {
    return true;
  }

  // Verificar se contém caracteres inválidos
  if (token.includes('\0') || token.includes('\x00') || token.includes('�')) {
    return true;
  }

  // Verificar se é um JWT válido (3 partes) ou token base64 válido
  const parts = token.split('.');
  if (parts.length === 3) {
    // É um JWT, verificar se as partes são válidas
    try {
      atob(parts[0]); // header
      atob(parts[1]); // payload
      // signature não precisa ser decodificada
      return false; // JWT válido
    } catch {
      return true; // JWT inválido
    }
  } else {
    // Verificar se é base64 válido
    try {
      const decoded = atob(token);
      JSON.parse(decoded);
      return false; // Base64 válido
    } catch {
      return true; // Base64 inválido
    }
  }
};

export const logTokenInfo = (): void => {
  if (typeof window === 'undefined') return;

  const tokenKeys = [
    'accessToken',
    'auth_token',
    'token',
    'authToken',
    'jwt_token'
  ];

  console.log('🔍 Informações dos tokens armazenados:');
  
  tokenKeys.forEach(key => {
    try {
      const token = localStorage.getItem(key);
      if (token) {
        const parts = token.split('.');
        console.log(`${key}:`, {
          length: token.length,
          preview: token.substring(0, 50) + '...',
          isJWT: parts.length === 3,
          parts: parts.length,
          isInvalid: isInvalidToken(token)
        });
      } else {
        console.log(`${key}: não encontrado`);
      }
    } catch (error) {
      console.error(`Erro ao verificar ${key}:`, error);
    }
  });
}; 