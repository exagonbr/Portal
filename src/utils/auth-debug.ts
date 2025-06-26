/**
 * Utilitário para diagnosticar problemas de autenticação
 */

export interface AuthDiagnostic {
  token: {
    present: boolean;
    valid: boolean;
    length: number;
    source: string;
  };
  session: {
    present: boolean;
    valid: boolean;
    user: any;
    expiresAt: number | null;
  };
  cookies: {
    authToken: string | null;
    userData: string | null;
  };
  localStorage: {
    authToken: string | null;
    userSession: string | null;
  };
  recommendations: string[];
}

/**
 * Executa diagnóstico completo da autenticação
 */
export function diagnoseAuth(): AuthDiagnostic {
  const diagnostic: AuthDiagnostic = {
    token: {
      present: false,
      valid: false,
      length: 0,
      source: 'none'
    },
    session: {
      present: false,
      valid: false,
      user: null,
      expiresAt: null
    },
    cookies: {
      authToken: null,
      userData: null
    },
    localStorage: {
      authToken: null,
      userSession: null
    },
    recommendations: []
  };

  // Verificar localStorage
  if (typeof window !== 'undefined') {
    diagnostic.localStorage.authToken = localStorage.getItem('auth_token');
    diagnostic.localStorage.userSession = localStorage.getItem('user_session');
    
    // Verificar token
    const token = diagnostic.localStorage.authToken;
    if (token) {
      diagnostic.token.present = true;
      diagnostic.token.length = token.length;
      diagnostic.token.source = 'localStorage';
      diagnostic.token.valid = token.length > 10 && token.includes('.');
    }
    
    // Verificar sessão
    if (diagnostic.localStorage.userSession) {
      try {
        const sessionData = JSON.parse(diagnostic.localStorage.userSession);
        diagnostic.session.present = true;
        diagnostic.session.user = sessionData.user;
        diagnostic.session.expiresAt = sessionData.expiresAt;
        diagnostic.session.valid = sessionData.expiresAt > Date.now();
      } catch (error) {
        diagnostic.session.present = false;
      }
    }
    
    // Verificar cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        diagnostic.cookies.authToken = value;
      }
      if (name === 'user_data') {
        diagnostic.cookies.userData = value;
      }
    }
  }

  // Gerar recomendações
  if (!diagnostic.token.present) {
    diagnostic.recommendations.push('❌ Token não encontrado - Faça login novamente');
  } else if (!diagnostic.token.valid) {
    diagnostic.recommendations.push('⚠️ Token parece inválido - Verifique formato');
  }

  if (!diagnostic.session.present) {
    diagnostic.recommendations.push('❌ Sessão não encontrada - Faça login novamente');
  } else if (!diagnostic.session.valid) {
    diagnostic.recommendations.push('⏰ Sessão expirada - Faça login novamente');
  }

  if (diagnostic.token.present && diagnostic.session.present && diagnostic.token.valid && diagnostic.session.valid) {
    diagnostic.recommendations.push('✅ Autenticação parece estar OK');
  }

  return diagnostic;
}

/**
 * Testa uma requisição para a API com o token atual
 */
export async function testApiCall(endpoint: string = '/api/users/stats'): Promise<{
  success: boolean;
  status: number;
  data?: any;
  error?: string;
}> {
  try {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return {
        success: false,
        status: 0,
        error: 'Token não encontrado'
      };
    }

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data : undefined,
      error: !response.ok ? (data.error || data.message || `HTTP ${response.status}`) : undefined
    };

  } catch (error: any) {
    return {
      success: false,
      status: 0,
      error: error.message || 'Erro de rede'
    };
  }
}

/**
 * Limpa todos os dados de autenticação
 */
export function clearAllAuth(): void {
  if (typeof window !== 'undefined') {
    // Limpar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user_session');
    localStorage.removeItem('user');
    
    // Limpar cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    console.log('🧹 Todos os dados de autenticação foram limpos');
  }
}

/**
 * Força um novo login redirecionando para a página de login
 */
export function forceRelogin(): void {
  clearAllAuth();
  
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = loginUrl;
  }
}

/**
 * Executa diagnóstico e exibe no console
 */
export function debugAuth(): void {
  const diagnostic = diagnoseAuth();
  
  console.group('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO');
  console.log('📋 Diagnóstico completo:', diagnostic);
  
  console.group('🎫 Token');
  console.log('Presente:', diagnostic.token.present);
  console.log('Válido:', diagnostic.token.valid);
  console.log('Tamanho:', diagnostic.token.length);
  console.log('Fonte:', diagnostic.token.source);
  console.groupEnd();
  
  console.group('👤 Sessão');
  console.log('Presente:', diagnostic.session.present);
  console.log('Válida:', diagnostic.session.valid);
  console.log('Usuário:', diagnostic.session.user?.name, diagnostic.session.user?.role);
  console.log('Expira em:', diagnostic.session.expiresAt ? new Date(diagnostic.session.expiresAt) : 'N/A');
  console.groupEnd();
  
  console.group('📝 Recomendações');
  diagnostic.recommendations.forEach(rec => console.log(rec));
  console.groupEnd();
  
  console.groupEnd();
  
  // Teste automático da API
  testApiCall().then(result => {
    console.group('🧪 TESTE DA API');
    console.log('Sucesso:', result.success);
    console.log('Status:', result.status);
    if (result.error) console.error('Erro:', result.error);
    if (result.data) console.log('Dados:', result.data);
    console.groupEnd();
  });
}

// Expor globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  (window as any).clearAllAuth = clearAllAuth;
  (window as any).forceRelogin = forceRelogin;
} 