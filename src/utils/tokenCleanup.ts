/**
 * Utilitário para limpar tokens inválidos do localStorage
 */

// Lista padronizada de chaves de token
export const TOKEN_KEYS = [
  'accessToken',
  'auth_token',
  'token',
  'authToken',
  'jwt_token'
];

export const cleanupInvalidTokens = (): void => {
  if (typeof window === 'undefined') return;

  TOKEN_KEYS.forEach(key => {
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

// Função para verificar se um token é inválido
function isInvalidToken(token: string): boolean {
  if (!token || token === 'null' || token === 'undefined' || token === 'false' || token === 'true') {
    return true;
  }

  if (token.length < 10) {
    return true;
  }

  // Verificar se é um JWT válido (3 partes)
  const parts = token.split('.');
  if (parts.length === 3) {
    try {
      // Verificar se a segunda parte é um JSON válido em base64
      const payload = JSON.parse(atob(parts[1]));
      
      // Verificar expiração
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return true; // Token expirado
      }
      
      return false; // Token parece válido
    } catch {
      return true; // Não foi possível decodificar
    }
  }

  // Verificar se é um token base64 válido
  try {
    const decoded = atob(token);
    const obj = JSON.parse(decoded);
    
    // Verificar campos mínimos
    if (!obj.userId || !obj.email || !obj.role) {
      return true;
    }
    
    // Verificar expiração
    if (obj.exp && obj.exp < Math.floor(Date.now() / 1000)) {
      return true;
    }
    
    return false; // Token parece válido
  } catch {
    return true; // Não é um token base64 válido
  }
}

export const logTokenInfo = (): void => {
  if (typeof window === 'undefined') return;

  console.log('🔍 Informações dos tokens armazenados:');
  
  TOKEN_KEYS.forEach(key => {
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

/**
 * Função para padronizar tokens em todas as chaves de armazenamento
 * Copia um token válido para todas as chaves de armazenamento
 */
export const standardizeTokens = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Primeiro limpar tokens inválidos
  cleanupInvalidTokens();
  
  // Buscar o primeiro token válido
  let validToken: string | null = null;
  
  // Verificar localStorage
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key);
    if (token && !isInvalidToken(token)) {
      validToken = token;
      break;
    }
  }
  
  // Se não encontrou no localStorage, verificar sessionStorage
  if (!validToken) {
    for (const key of TOKEN_KEYS) {
      const token = sessionStorage.getItem(key);
      if (token && !isInvalidToken(token)) {
        validToken = token;
        break;
      }
    }
  }
  
  // Se encontrou um token válido, padronizar em todas as chaves
  if (validToken) {
    console.log('✅ Token válido encontrado, padronizando em todas as chaves');
    
    // Armazenar em localStorage
    TOKEN_KEYS.forEach(key => {
      try {
        localStorage.setItem(key, validToken!);
      } catch (error) {
        console.error(`Erro ao definir ${key} no localStorage:`, error);
      }
    });
    
    // Definir cookies para requisições do servidor
    document.cookie = `accessToken=${validToken}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `auth_token=${validToken}; path=/; max-age=86400; SameSite=Lax`;
    
    return true;
  }
  
  console.log('❌ Nenhum token válido encontrado para padronização');
  return false;
};

const tokenCleanup = {
  cleanupInvalidTokens,
  logTokenInfo,
  standardizeTokens
};

export default tokenCleanup; 