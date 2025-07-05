// Script para testar o fluxo de login e identificar problemas
// Execute este script no console do navegador

export const testLoginFlow = () => {
  console.group('🧪 Teste do Fluxo de Login');
  
  // 1. Verificar token no localStorage
  const token = localStorage.getItem('accessToken');
  console.log('1. Token no localStorage:', {
    exists: !!token,
    length: token?.length,
    preview: token?.substring(0, 50) + '...'
  });
  
  // 2. Verificar se o token é válido
  if (token) {
    const parts = token.split('.');
    console.log('2. Estrutura do token:', {
      parts: parts.length,
      isValidJWT: parts.length === 3
    });
    
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log('3. Payload do token:', {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          exp: payload.exp,
          isExpired: payload.exp ? payload.exp * 1000 < Date.now() : false
        });
      } catch (error) {
        console.error('3. Erro ao decodificar payload:', error);
      }
    }
  }
  
  // 3. Verificar estado do contexto de autenticação
  const authContext = (window as any).authContext;
  if (authContext) {
    console.log('4. Estado do AuthContext:', {
      hasUser: !!authContext.user,
      isLoading: authContext.isLoading,
      isAuthenticated: authContext.isAuthenticated
    });
  } else {
    console.log('4. AuthContext não está disponível globalmente');
  }
  
  // 4. Verificar URL atual
  console.log('5. Informações da URL:', {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    origin: window.location.origin
  });
  
  // 5. Verificar variáveis de ambiente
  console.log('6. Variáveis de ambiente:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL,
    NEXT_PUBLIC_USE_TEST_TOKEN: process.env.NEXT_PUBLIC_USE_TEST_TOKEN
  });
  
  console.groupEnd();
};

export const simulateLogin = async (email: string = 'admin@sistema.com', password: string = 'admin123') => {
  console.group('🔐 Simulação de Login');
  
  try {
    console.log('1. Iniciando login com:', { email, password });
    
    // Simular chamada de API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    console.log('2. Resposta da API:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    const data = await response.json();
    console.log('3. Dados da resposta:', data);
    
    if (data.success && data.data?.accessToken) {
      console.log('4. Login bem-sucedido, armazenando token...');
      localStorage.setItem('accessToken', data.data.accessToken);
      
      // Verificar se o token foi armazenado corretamente
      const storedToken = localStorage.getItem('accessToken');
      console.log('5. Token armazenado:', {
        stored: !!storedToken,
        matches: storedToken === data.data.accessToken
      });
      
      console.log('6. Recarregue a página para ver se o login persiste');
    } else {
      console.error('4. Login falhou:', data.message);
    }
    
  } catch (error) {
    console.error('Erro durante simulação de login:', error);
  }
  
  console.groupEnd();
};

export const debugRedirectFlow = () => {
  console.group('🔄 Debug do Fluxo de Redirecionamento');
  
  // Verificar histórico de redirecionamentos
  const redirectHistory = sessionStorage.getItem('redirect_history');
  if (redirectHistory) {
    try {
      const history = JSON.parse(redirectHistory);
      console.log('1. Histórico de redirecionamentos:', history);
    } catch (error) {
      console.log('1. Erro ao parsear histórico:', error);
    }
  } else {
    console.log('1. Nenhum histórico de redirecionamento encontrado');
  }
  
  // Verificar loops de redirecionamento
  const loopCheck = sessionStorage.getItem('login_redirect_loop_check');
  if (loopCheck) {
    const lastTime = parseInt(loopCheck);
    const now = Date.now();
    console.log('2. Verificação de loop:', {
      lastRedirect: new Date(lastTime).toISOString(),
      timeSince: now - lastTime,
      possibleLoop: (now - lastTime) < 5000
    });
  } else {
    console.log('2. Nenhuma verificação de loop encontrada');
  }
  
  // Verificar dados de sessão
  const sessionKeys = Object.keys(sessionStorage);
  console.log('3. Chaves no sessionStorage:', sessionKeys);
  
  const localKeys = Object.keys(localStorage);
  console.log('4. Chaves no localStorage:', localKeys);
  
  console.groupEnd();
};

// Tornar disponível globalmente
if (typeof window !== 'undefined') {
  (window as any).testLoginFlow = testLoginFlow;
  (window as any).simulateLogin = simulateLogin;
  (window as any).debugRedirectFlow = debugRedirectFlow;
  
  console.log('🔧 Funções de debug disponíveis:');
  console.log('- testLoginFlow() - Testa o fluxo de login');
  console.log('- simulateLogin() - Simula um login');
  console.log('- debugRedirectFlow() - Debug dos redirecionamentos');
} 