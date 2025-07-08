/**
 * Utilitário de Diagnóstico de Autenticação
 * Use no console do navegador para diagnosticar problemas de token
 */

interface AuthDiagnostic {
  hasToken: boolean;
  tokenSource: string | null;
  tokenLength: number;
  tokenPreview: string | null;
  storageKeys: string[];
  cookieInfo: { name: string; value: string }[];
  userDataExists: boolean;
  recommendations: string[];
}

export const diagnoseAuth = (): AuthDiagnostic => {
  const diagnostic: AuthDiagnostic = {
    hasToken: false,
    tokenSource: null,
    tokenLength: 0,
    tokenPreview: null,
    storageKeys: [],
    cookieInfo: [],
    userDataExists: false,
    recommendations: []
  };

  // Verificar se estamos no browser
  if (typeof window === 'undefined') {
    diagnostic.recommendations.push('Executando no servidor - não é possível verificar localStorage/cookies');
    return diagnostic;
  }

  // 1. Buscar token no localStorage/sessionStorage
  const possibleTokenKeys = [
    'accessToken',
    'auth_token', 
    'token',
    'authToken'
  ];

  for (const key of possibleTokenKeys) {
    const localToken = localStorage.getItem(key);
    const sessionToken = sessionStorage.getItem(key);
    
    if (localToken && localToken.length > 10) {
      diagnostic.hasToken = true;
      diagnostic.tokenSource = `localStorage.${key}`;
      diagnostic.tokenLength = localToken.length;
      diagnostic.tokenPreview = localToken.substring(0, 20) + '...';
      break;
    }
    
    if (sessionToken && sessionToken.length > 10) {
      diagnostic.hasToken = true;
      diagnostic.tokenSource = `sessionStorage.${key}`;
      diagnostic.tokenLength = sessionToken.length;
      diagnostic.tokenPreview = sessionToken.substring(0, 20) + '...';
      break;
    }
  }

  // 2. Listar todas as chaves do localStorage
  diagnostic.storageKeys = Object.keys(localStorage);

  // 3. Verificar cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      diagnostic.cookieInfo.push({ name, value: value.length > 20 ? value.substring(0, 20) + '...' : value });
      
      // Verificar se é um token nos cookies
      if (!diagnostic.hasToken && possibleTokenKeys.includes(name) && value.length > 10) {
        diagnostic.hasToken = true;
        diagnostic.tokenSource = `cookie.${name}`;
        diagnostic.tokenLength = value.length;
        diagnostic.tokenPreview = decodeURIComponent(value).substring(0, 20) + '...';
      }
    }
  }

  // 4. Verificar dados do usuário
  const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
  diagnostic.userDataExists = !!userData;

  // 5. Gerar recomendações
  if (!diagnostic.hasToken) {
    diagnostic.recommendations.push('❌ Nenhum token encontrado - usuário não está autenticado');
    diagnostic.recommendations.push('💡 Faça login novamente em /auth/login');
  } else {
    diagnostic.recommendations.push('✅ Token encontrado');
    
    if (diagnostic.tokenLength < 50) {
      diagnostic.recommendations.push('⚠️ Token parece muito curto - pode estar corrompido');
    }
    
    if (!diagnostic.userDataExists) {
      diagnostic.recommendations.push('⚠️ Dados do usuário não encontrados - sessão pode estar incompleta');
    }
  }

  return diagnostic;
};

/**
 * Função para testar conectividade com a API
 */
export const testApiConnection = async (): Promise<{
  success: boolean;
  status: number;
  message: string;
  url: string;
}> => {
  try {
    const diagnostic = diagnoseAuth();
    
    if (!diagnostic.hasToken) {
      return {
        success: false,
        status: 0,
        message: 'Nenhum token encontrado para testar',
        url: ''
      };
    }

    // Obter o token
    let token = '';
    if (diagnostic.tokenSource?.includes('localStorage')) {
      const key = diagnostic.tokenSource.split('.')[1];
      token = localStorage.getItem(key) || '';
    } else if (diagnostic.tokenSource?.includes('sessionStorage')) {
      const key = diagnostic.tokenSource.split('.')[1];
      token = sessionStorage.getItem(key) || '';
    } else if (diagnostic.tokenSource?.includes('cookie')) {
      const key = diagnostic.tokenSource.split('.')[1];
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === key) {
          token = decodeURIComponent(value);
          break;
        }
      }
    }

    const url = '/api/tv-shows?page=1&limit=1';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Conexão com API bem-sucedida' : `Erro na API: ${response.statusText}`,
      url
    };

  } catch (error) {
    return {
      success: false,
      status: 0,
      message: `Erro de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      url: '/api/tv-shows'
    };
  }
};

/**
 * Função para limpar todos os tokens (útil para troubleshooting)
 */
export const clearAllTokens = (): void => {
  if (typeof window === 'undefined') {
    console.warn('Função só pode ser executada no browser');
    return;
  }

  const tokenKeys = ['accessToken', 'auth_token', 'token', 'authToken', 'refreshToken'];
  
  // Limpar localStorage
  tokenKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Limpar sessionStorage
  tokenKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  // Limpar cookies relacionados a tokens
  tokenKeys.forEach(key => {
    document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
  
  console.log('🧹 Todos os tokens foram limpos. Faça login novamente.');
};

/**
 * Função para uso no console do navegador
 */
export const authDebug = {
  diagnose: diagnoseAuth,
  testApi: testApiConnection,
  clearTokens: clearAllTokens,
  
  // Função de conveniência para executar diagnóstico completo
  run: async () => {
    console.log('🔍 Executando diagnóstico de autenticação...\n');
    
    const diagnostic = diagnoseAuth();
    console.log('📊 Diagnóstico:', diagnostic);
    
    if (diagnostic.hasToken) {
      console.log('\n🌐 Testando conectividade com API...');
      const apiTest = await testApiConnection();
      console.log('🔗 Teste de API:', apiTest);
    }
    
    console.log('\n💡 Recomendações:');
    diagnostic.recommendations.forEach(rec => console.log(`   ${rec}`));
    
    console.log('\n🛠️ Comandos disponíveis:');
    console.log('   authDebug.diagnose() - Executar diagnóstico');
    console.log('   authDebug.testApi() - Testar API');
    console.log('   authDebug.clearTokens() - Limpar todos os tokens');
    
    return { diagnostic, apiTest: diagnostic.hasToken ? await testApiConnection() : null };
  }
};

// Adicionar ao window para uso no console (apenas em desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authDebug = authDebug;
}

export default authDebug;
