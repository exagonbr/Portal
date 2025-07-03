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