/**
 * Utilitário para debug de autenticação
 */

export function debugAuthState() {
  if (typeof window === 'undefined') {
    console.log('🔍 [AUTH-DEBUG] Executando no servidor, sem acesso ao localStorage');
    return null;
  }

  console.group('🔍 [AUTH-DEBUG] Estado da Autenticação');
  
  // Verificar localStorage
  const possibleKeys = ['auth_token', 'token', 'authToken'];
  const localStorageTokens: Record<string, string | null> = {};
  
  possibleKeys.forEach(key => {
    const value = localStorage.getItem(key);
    localStorageTokens[key] = value;
    console.log(`📦 localStorage.${key}:`, value ? `${value.substring(0, 20)}...` : 'null');
  });

  // Verificar sessionStorage
  const sessionStorageTokens: Record<string, string | null> = {};
  possibleKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    sessionStorageTokens[key] = value;
    console.log(`📦 sessionStorage.${key}:`, value ? `${value.substring(0, 20)}...` : 'null');
  });

  // Verificar cookies
  const cookies = document.cookie.split(';');
  const cookieTokens: Record<string, string> = {};
  
  cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (possibleKeys.includes(name) && value) {
      cookieTokens[name] = value;
      console.log(`🍪 cookie.${name}:`, value ? `${value.substring(0, 20)}...` : 'null');
    }
  });

  // Encontrar o melhor token
  let bestToken = null;
  for (const key of possibleKeys) {
    const token = localStorageTokens[key] || sessionStorageTokens[key] || cookieTokens[key];
    if (token && token.trim() !== '') {
      bestToken = token.trim();
      console.log(`✅ Token encontrado em: ${key}`);
      break;
    }
  }

  if (bestToken) {
    // Verificar se é um JWT válido
    const jwtParts = bestToken.split('.');
    if (jwtParts.length === 3) {
      try {
        const payload = JSON.parse(atob(jwtParts[1]));
        console.log('🔑 JWT Payload:', {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'N/A',
          isExpired: payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : false
        });
      } catch (error) {
        console.warn('⚠️ Erro ao decodificar JWT:', error);
      }
    } else {
      console.log('📝 Token não é um JWT válido (não tem 3 partes)');
    }
  } else {
    console.log('❌ Nenhum token encontrado');
  }

  console.groupEnd();

  return {
    localStorage: localStorageTokens,
    sessionStorage: sessionStorageTokens,
    cookies: cookieTokens,
    bestToken
  };
}

// Expor no window para debug manual
if (typeof window !== 'undefined') {
  (window as any).debugAuthState = debugAuthState;
}