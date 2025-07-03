/**
 * Diagnóstico de autenticação
 */

import { SimpleAuthDiagnostic } from './auth-types';

/**
 * Executa diagnóstico de autenticação
 */
export function runAuthDiagnostics(): SimpleAuthDiagnostic {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Verificar se estamos no cliente
  if (typeof window === 'undefined') {
    return {
      hasAuth: false,
      hasAccessToken: false,
      hasRefreshToken: false,
      hasUserData: false,
      cookies: 0,
      issues: ['Executando no servidor - localStorage não disponível'],
      recommendations: ['Execute este diagnóstico no navegador']
    };
  }
  
  // Verificar tokens diretamente no localStorage
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
  const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');
  const userData = localStorage.getItem('user') || localStorage.getItem('userData');
  
  const hasAccessToken = !!accessToken;
  const hasRefreshToken = !!refreshToken;
  const hasUserData = !!userData;
  
  // Verificar tokens
  if (!hasAccessToken) {
    issues.push('Token de acesso não encontrado');
    recommendations.push('Faça login para obter um token de acesso');
  }
  
  if (!hasRefreshToken) {
    issues.push('Token de refresh não encontrado');
    recommendations.push('Faça login novamente para obter um refresh token');
  }
  
  // Verificar expiração do token
  let tokenInfo: SimpleAuthDiagnostic['tokenInfo'];
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp ? payload.exp < now : false;
      const expiresIn = payload.exp 
        ? `${Math.floor((payload.exp - now) / 60)} minutos`
        : 'desconhecido';
      
      tokenInfo = {
        isExpired,
        expiresIn: isExpired ? '0 minutos' : expiresIn,
        role: payload.role,
        email: payload.email
      };
      
      if (isExpired) {
        issues.push('Token expirado');
        recommendations.push('Faça login novamente ou use o refresh token');
      } else if (payload.exp && (payload.exp - now) < 300) {
        issues.push('Token expirando em breve');
        recommendations.push('Considere renovar o token');
      }
    } catch (e) {
      issues.push('Token inválido ou corrompido');
      recommendations.push('Faça login novamente');
    }
  }
  
  // Contar cookies relacionados à autenticação
  const cookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => {
      const name = c.split('=')[0].toLowerCase();
      return name.includes('token') || name.includes('auth') || name.includes('session');
    });
  
  return {
    hasAuth: hasAccessToken || hasRefreshToken,
    hasAccessToken,
    hasRefreshToken,
    hasUserData,
    tokenInfo,
    cookies: cookies.length,
    issues,
    recommendations
  };
}

/**
 * Imprime diagnóstico no console
 */
export function logAuthDiagnostics(): void {
  const diagnostic = runAuthDiagnostics();
  
  console.group('🔐 Diagnóstico de Autenticação');
  console.log('✅ Autenticado:', diagnostic.hasAuth ? 'Sim' : 'Não');
  console.log('🔑 Access Token:', diagnostic.hasAccessToken ? 'Presente' : 'Ausente');
  console.log('🔄 Refresh Token:', diagnostic.hasRefreshToken ? 'Presente' : 'Ausente');
  console.log('👤 Dados do Usuário:', diagnostic.hasUserData ? 'Presente' : 'Ausente');
  console.log('🍪 Cookies:', diagnostic.cookies);
  
  if (diagnostic.tokenInfo) {
    console.group('📋 Informações do Token');
    console.log('Expirado:', diagnostic.tokenInfo.isExpired ? 'Sim' : 'Não');
    console.log('Expira em:', diagnostic.tokenInfo.expiresIn);
    console.log('Role:', diagnostic.tokenInfo.role || 'N/A');
    console.log('Email:', diagnostic.tokenInfo.email || 'N/A');
    console.groupEnd();
  }
  
  if (diagnostic.issues.length > 0) {
    console.group('⚠️ Problemas');
    diagnostic.issues.forEach((issue: string) => console.log(`- ${issue}`));
    console.groupEnd();
  }
  
  if (diagnostic.recommendations.length > 0) {
    console.group('💡 Recomendações');
    diagnostic.recommendations.forEach((rec: string) => console.log(`- ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Alias para compatibilidade
 */
export const debugAuth = logAuthDiagnostics;
export const logSimpleAuthDiagnostic = logAuthDiagnostics;

/**
 * Limpa todos os dados de autenticação
 */
export function clearAllAuthData(): void {
  if (typeof window === 'undefined') return;
  
  // Lista de possíveis chaves de autenticação
  const authKeys = [
    'accessToken',
    'auth_token',
    'token',
    'authToken',
    'refreshToken',
    'refresh_token',
    'user',
    'userData',
    'userInfo',
    'session',
    'sessionId'
  ];
  
  // Limpar localStorage
  authKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Limpar sessionStorage
  authKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  // Limpar cookies relacionados à autenticação
  const authCookies = ['accessToken', 'refreshToken', 'session', 'auth', 'token', 'sessionId'];
  authCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
  });
  
  console.log('🧹 Todos os dados de autenticação foram limpos');
}

/**
 * Obtém informações de debug sobre o estado do login
 */
export function getLoginDebugInfo() {
  if (typeof window === 'undefined') {
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      hasUserData: false,
      cookies: []
    };
  }
  
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('auth_token');
  const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('refresh_token');
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
import { getAuthToken } from '../services/auth';
import { getCurrentToken, validateToken, isAuthenticated } from './token-validator';

export interface AuthDiagnosticResult {
  isAuthenticated: boolean;
  hasToken: boolean;
  tokenValid: boolean;
  tokenSource: string | null;
  apiConnectivity: boolean;
  errors: string[];
  warnings: string[];
}

export async function runAuthDiagnostics(): Promise<AuthDiagnosticResult> {
  const result: AuthDiagnosticResult = {
    isAuthenticated: false,
    hasToken: false,
    tokenValid: false,
    tokenSource: null,
    apiConnectivity: false,
    errors: [],
    warnings: []
  };

  try {
    // Check if user is authenticated
    result.isAuthenticated = isAuthenticated();

    // Check for token presence
    const token = getCurrentToken();
    result.hasToken = !!token;

    if (token) {
      // Validate token
      result.tokenValid = validateToken(token);
      
      // Determine token source
      if (localStorage.getItem('accessToken')) {
        result.tokenSource = 'localStorage.accessToken';
      } else if (localStorage.getItem('auth_token')) {
        result.tokenSource = 'localStorage.auth_token';
      } else if (localStorage.getItem('token')) {
        result.tokenSource = 'localStorage.token';
      } else if (sessionStorage.getItem('accessToken')) {
        result.tokenSource = 'sessionStorage.accessToken';
      } else {
        result.tokenSource = 'cookies or other';
      }
    }

    // Test API connectivity
    result.apiConnectivity = await testApiConnectivity();

    // Generate warnings and errors
    if (!result.hasToken) {
      result.errors.push('No authentication token found');
    } else if (!result.tokenValid) {
      result.errors.push('Authentication token is invalid or expired');
    }

    if (!result.apiConnectivity) {
      result.warnings.push('API connectivity test failed');
    }

  } catch (error) {
    result.errors.push(`Diagnostic error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

export async function testApiConnectivity(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.warn('API connectivity test failed:', error);
    return false;
  }
}

export function clearAllAuthData(): void {
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('systemSettings');

  // Clear sessionStorage
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');

  // Clear cookies
  const cookies = ['accessToken', 'auth_token', 'token', 'session'];
  cookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  });

  console.log('All authentication data cleared');
}

export function debugAuth(): void {
  runAuthDiagnostics().then(result => {
    console.group('🔍 Auth Diagnostics');
    console.log('Is Authenticated:', result.isAuthenticated);
    console.log('Has Token:', result.hasToken);
    console.log('Token Valid:', result.tokenValid);
    console.log('Token Source:', result.tokenSource);
    console.log('API Connectivity:', result.apiConnectivity);
    
    if (result.errors.length > 0) {
      console.error('Errors:', result.errors);
    }
    
    if (result.warnings.length > 0) {
      console.warn('Warnings:', result.warnings);
    }
    
    console.groupEnd();
  });
}
