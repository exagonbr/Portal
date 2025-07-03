/**
 * Utilitário para debug de problemas de login
 */

import { validateToken } from './token-validator';

export interface LoginDebugInfo {
  hasToken: boolean;
  tokenValid: boolean;
  tokenExpired: boolean;
  tokenPayload?: any;
  localStorage: {
    accessToken?: string;
    refreshToken?: string;
  };
  sessionStorage: {
    accessToken?: string;
    refreshToken?: string;
  };
  cookies: string[];
  userAgent: string;
  timestamp: string;
}

/**
 * Coleta informações de debug sobre o estado de login
 */
export function getLoginDebugInfo(): LoginDebugInfo {
  const debugInfo: LoginDebugInfo = {
    hasToken: false,
    tokenValid: false,
    tokenExpired: false,
    localStorage: {},
    sessionStorage: {},
    cookies: [],
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    timestamp: new Date().toISOString()
  };

  if (typeof window === 'undefined') {
    return debugInfo;
  }

  // Verificar localStorage
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (accessToken) {
    debugInfo.localStorage.accessToken = accessToken.substring(0, 20) + '...';
    debugInfo.hasToken = true;
    
    const validation = validateToken(accessToken);
    debugInfo.tokenValid = validation.isValid;
    debugInfo.tokenExpired = validation.isExpired;
    debugInfo.tokenPayload = validation.payload;
  }
  
  if (refreshToken) {
    debugInfo.localStorage.refreshToken = refreshToken.substring(0, 20) + '...';
  }

  // Verificar sessionStorage
  const sessionAccessToken = sessionStorage.getItem('accessToken');
  const sessionRefreshToken = sessionStorage.getItem('refreshToken');
  
  if (sessionAccessToken) {
    debugInfo.sessionStorage.accessToken = sessionAccessToken.substring(0, 20) + '...';
  }
  
  if (sessionRefreshToken) {
    debugInfo.sessionStorage.refreshToken = sessionRefreshToken.substring(0, 20) + '...';
  }

  // Verificar cookies
  debugInfo.cookies = document.cookie.split(';').map(cookie => cookie.trim().split('=')[0]);

  return debugInfo;
}

/**
 * Imprime informações de debug no console
 */
export function logLoginDebugInfo(): void {
  const debugInfo = getLoginDebugInfo();
  
  console.group('🔍 Login Debug Info');
  console.log('📅 Timestamp:', debugInfo.timestamp);
  console.log('🔑 Has Token:', debugInfo.hasToken);
  console.log('✅ Token Valid:', debugInfo.tokenValid);
  console.log('⏰ Token Expired:', debugInfo.tokenExpired);
  
  if (debugInfo.tokenPayload) {
    console.log('📋 Token Payload:', debugInfo.tokenPayload);
  }
  
  console.log('💾 LocalStorage:', debugInfo.localStorage);
  console.log('🗂️ SessionStorage:', debugInfo.sessionStorage);
  console.log('🍪 Cookies:', debugInfo.cookies);
  console.log('🌐 User Agent:', debugInfo.userAgent);
  console.groupEnd();
}

/**
 * Limpa todos os dados de autenticação
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  // Limpar localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Limpar sessionStorage
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
  
  // Limpar cookies relacionados à autenticação
  const authCookies = ['accessToken', 'refreshToken', 'session', 'auth'];
  authCookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
  
  console.log('🧹 Dados de autenticação limpos');
}