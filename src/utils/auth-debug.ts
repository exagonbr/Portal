/**
 * Utilitário para debug de estado de autenticação
 */

import { validateToken } from './token-validator';

/**
 * Exibe o estado atual da autenticação no console
 */
export function debugAuthState(): void {
  console.group('🔍 Debug de Estado de Autenticação');
  
  if (typeof window === 'undefined') {
    console.log('⚠️ Executando no servidor - localStorage não disponível');
    console.groupEnd();
    return;
  }
  
  // Verificar tokens no localStorage
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  const userData = localStorage.getItem('userData');
  
  console.log('📦 LocalStorage:');
  console.log('  - accessToken:', accessToken ? `${accessToken.substring(0, 20)}...` : 'não encontrado');
  console.log('  - refreshToken:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'não encontrado');
  console.log('  - user:', user ? 'presente' : 'não encontrado');
  console.log('  - userData:', userData ? 'presente' : 'não encontrado');
  
  // Verificar tokens no sessionStorage
  const sessionAccessToken = sessionStorage.getItem('accessToken');
  const sessionRefreshToken = sessionStorage.getItem('refreshToken');
  
  console.log('\n📦 SessionStorage:');
  console.log('  - accessToken:', sessionAccessToken ? `${sessionAccessToken.substring(0, 20)}...` : 'não encontrado');
  console.log('  - refreshToken:', sessionRefreshToken ? `${sessionRefreshToken.substring(0, 20)}...` : 'não encontrado');
  
  // Verificar cookies
  const cookies = document.cookie.split(';').map(c => c.trim());
  const authCookies = cookies.filter(c => {
    const name = c.split('=')[0].toLowerCase();
    return name.includes('token') || name.includes('auth') || name.includes('session');
  });
  
  console.log('\n🍪 Cookies de autenticação:');
  if (authCookies.length > 0) {
    authCookies.forEach(cookie => {
      const [name, value] = cookie.split('=');
      console.log(`  - ${name}: ${value ? value.substring(0, 20) + '...' : 'vazio'}`);
    });
  } else {
    console.log('  Nenhum cookie de autenticação encontrado');
  }
  
  // Validar token se existir
  const tokenToValidate = accessToken || sessionAccessToken;
  if (tokenToValidate) {
    console.log('\n🔐 Validação do Token:');
    const validation = validateToken(tokenToValidate);
    console.log('  - Válido:', validation.isValid);
    console.log('  - Expirado:', validation.isExpired);
    
    if (validation.payload) {
      console.log('  - Payload:');
      console.log('    - userId:', validation.payload.userId || validation.payload.sub);
      console.log('    - email:', validation.payload.email);
      console.log('    - role:', validation.payload.role);
      
      if (validation.payload.exp) {
        const expDate = new Date(validation.payload.exp * 1000);
        console.log('    - Expira em:', expDate.toLocaleString());
        
        const now = Date.now() / 1000;
        const timeLeft = validation.payload.exp - now;
        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / 60);
          const hours = Math.floor(minutes / 60);
          if (hours > 0) {
            console.log(`    - Tempo restante: ${hours}h ${minutes % 60}min`);
          } else {
            console.log(`    - Tempo restante: ${minutes}min`);
          }
        }
      }
    }
    
    if (validation.error) {
      console.log('  - Erro:', validation.error);
    }
  } else {
    console.log('\n⚠️ Nenhum token encontrado para validar');
  }
  
  // Verificar headers de autenticação
  console.log('\n📡 Headers de Autenticação (para próximas requisições):');
  console.log('  - Authorization: Bearer', tokenToValidate ? `${tokenToValidate.substring(0, 20)}...` : '[TOKEN NÃO ENCONTRADO]');
  
  console.groupEnd();
}

/**
 * Limpa o estado de autenticação para debug
 */
export function clearAuthStateForDebug(): void {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Limpando estado de autenticação...');
  
  // Limpar localStorage
  ['accessToken', 'refreshToken', 'user', 'userData', 'auth_token', 'token'].forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Limpar sessionStorage
  ['accessToken', 'refreshToken', 'user', 'userData', 'auth_token', 'token'].forEach(key => {
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
  
  console.log('✅ Estado de autenticação limpo');
}

/**
 * Simula um token de autenticação para testes
 */
export function setDebugToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Configurando token de debug...');
  localStorage.setItem('accessToken', token);
  console.log('✅ Token configurado no localStorage');
}

/**
 * Obtém informações resumidas do estado de autenticação
 */
export function getAuthStateSummary(): {
  hasToken: boolean;
  tokenLocation: 'localStorage' | 'sessionStorage' | 'none';
  isValid: boolean;
  isExpired: boolean;
  userInfo?: {
    id?: string;
    email?: string;
    role?: string;
  };
} {
  if (typeof window === 'undefined') {
    return {
      hasToken: false,
      tokenLocation: 'none',
      isValid: false,
      isExpired: false
    };
  }
  
  const localToken = localStorage.getItem('accessToken');
  const sessionToken = sessionStorage.getItem('accessToken');
  const token = localToken || sessionToken;
  
  if (!token) {
    return {
      hasToken: false,
      tokenLocation: 'none',
      isValid: false,
      isExpired: false
    };
  }
  
  const validation = validateToken(token);
  
  return {
    hasToken: true,
    tokenLocation: localToken ? 'localStorage' : 'sessionStorage',
    isValid: validation.isValid,
    isExpired: validation.isExpired,
    userInfo: validation.payload ? {
      id: validation.payload.userId || validation.payload.sub,
      email: validation.payload.email,
      role: validation.payload.role
    } : undefined
  };
}
