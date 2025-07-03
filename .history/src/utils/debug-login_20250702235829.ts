/**
 * Utilitário para debug de login
 */

interface DebugLoginResult {
  success: boolean;
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: any;
  error?: string;
  timing?: {
    start: number;
    end: number;
    duration: number;
  };
}

/**
 * Executa um teste de login com debug detalhado
 */
export async function debugLogin(email: string, password: string): Promise<DebugLoginResult> {
  const startTime = Date.now();
  
  try {
    console.log('🔐 [DEBUG-LOGIN] Iniciando teste de login...');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password.replace(/./g, '*'));
    
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const loginUrl = `${backendUrl}/api/auth/login`;
    
    console.log('🌐 URL de login:', loginUrl);
    
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Tempo de resposta: ${duration}ms`);
    console.log(`📡 Status HTTP: ${response.status} ${response.statusText}`);
    
    // Capturar headers relevantes
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('cookie')) {
        headers[key] = value;
      }
    });
    
    console.log('📋 Headers relevantes:', headers);
    
    let data = null;
    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
        console.log('📦 Resposta:', data);
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta:', parseError);
    }
    
    const result: DebugLoginResult = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers,
      data,
      timing: {
        start: startTime,
        end: endTime,
        duration
      }
    };
    
    if (response.ok) {
      console.log('✅ Login bem-sucedido!');
      
      // Verificar tokens no localStorage
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        console.log('🔑 Access Token presente:', !!accessToken);
        console.log('🔄 Refresh Token presente:', !!refreshToken);
        
        if (accessToken) {
          try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            console.log('👤 Payload do token:', payload);
          } catch (e) {
            console.error('❌ Erro ao decodificar token:', e);
          }
        }
      }
    } else {
      console.error('❌ Login falhou:', response.status, response.statusText);
    }
    
    return result;
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('❌ Erro durante login:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timing: {
        start: startTime,
        end: endTime,
        duration
      }
    };
  }
}

/**
 * Testa a conectividade com o backend
 */
export async function testBackendConnection(): Promise<{
  isConnected: boolean;
  responseTime?: number;
  error?: string;
}> {
  const startTime = Date.now();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const healthUrl = `${backendUrl}/api/health`;
  
  try {
    console.log('🏥 Testando conexão com backend:', healthUrl);
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const responseTime = Date.now() - startTime;
    
    console.log(`⏱️ Tempo de resposta: ${responseTime}ms`);
    console.log(`📡 Status: ${response.status}`);
    
    return {
      isConnected: response.ok,
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error('❌ Erro ao conectar com backend:', error);
    
    return {
      isConnected: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Limpa todos os dados de autenticação para teste
 */
export function clearAuthDataForTesting(): void {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Limpando dados de autenticação para teste...');
  
  // Limpar localStorage
  const keysToRemove = [
    'accessToken',
    'refreshToken',
    'user',
    'userData',
    'auth_token',
    'token'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Limpar cookies
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    if (name.toLowerCase().includes('token') || name.toLowerCase().includes('auth')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });
  
  console.log('✅ Dados de autenticação limpos');
}

/**
 * Obtém informações de debug sobre o estado do login
 */
export function getLoginDebugInfo(): {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasUserData: boolean;
  tokenInfo?: {
    exp?: number;
    iat?: number;
    userId?: string;
    email?: string;
    role?: string;
  };
  cookies: string[];
} {
  if (typeof window === 'undefined') {
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      hasUserData: false,
      cookies: []
    };
  }
  
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const userData = localStorage.getItem('user') || localStorage.getItem('userData');
  
  let tokenInfo = undefined;
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      tokenInfo = {
        exp: payload.exp,
        iat: payload.iat,
        userId: payload.userId || payload.sub,
        email: payload.email,
        role: payload.role
      };
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
    }
  }
  
  // Listar cookies relevantes
  const cookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => {
      const name = c.split('=')[0].toLowerCase();
      return name.includes('token') || name.includes('auth') || name.includes('session');
    });
  
  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasUserData: !!userData,
    tokenInfo,
    cookies
  };
}