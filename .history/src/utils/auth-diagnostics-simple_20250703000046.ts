/**
 * Versão simplificada do diagnóstico de autenticação
 */

import { getLoginDebugInfo } from './debug-login';

export interface SimpleAuthDiagnostic {
  hasAuth: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasUserData: boolean;
  tokenInfo?: {
    isExpired: boolean;
    expiresIn?: string;
    role?: string;
    email?: string;
  };
  cookies: number;
  issues: string[];
  recommendations: string[];
}

/**
 * Executa diagnóstico simplificado de autenticação
 */
export function runSimpleAuthDiagnostic(): SimpleAuthDiagnostic {
  const debugInfo = getLoginDebugInfo();
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Verificar tokens
  if (!debugInfo.hasAccessToken) {
    issues.push('Token de acesso não encontrado');
    recommendations.push('Faça login para obter um token de acesso');
  }
  
  if (!debugInfo.hasRefreshToken) {
    issues.push('Token de refresh não encontrado');
    recommendations.push('Faça login novamente para obter um refresh token');
  }
  
  // Verificar expiração do token
  let tokenInfo: SimpleAuthDiagnostic['tokenInfo'];
  if (debugInfo.tokenInfo) {
    const now = Math.floor(Date.now() / 1000);
    const isExpired = debugInfo.tokenInfo.exp ? debugInfo.tokenInfo.exp < now : false;
    const expiresIn = debugInfo.tokenInfo.exp 
      ? `${Math.floor((debugInfo.tokenInfo.exp - now) / 60)} minutos`
      : 'desconhecido';
    
    tokenInfo = {
      isExpired,
      expiresIn: isExpired ? '0 minutos' : expiresIn,
      role: debugInfo.tokenInfo.role,
      email: debugInfo.tokenInfo.email
    };
    
    if (isExpired) {
      issues.push('Token expirado');
      recommendations.push('Faça login novamente ou use o refresh token');
    } else if (debugInfo.tokenInfo.exp && (debugInfo.tokenInfo.exp - now) < 300) {
      issues.push('Token expirando em breve');
      recommendations.push('Considere renovar o token');
    }
  }
  
  return {
    hasAuth: debugInfo.hasAccessToken || debugInfo.hasRefreshToken,
    hasAccessToken: debugInfo.hasAccessToken,
    hasRefreshToken: debugInfo.hasRefreshToken,
    hasUserData: debugInfo.hasUserData,
    tokenInfo,
    cookies: debugInfo.cookies.length,
    issues,
    recommendations
  };
}

/**
 * Imprime diagnóstico simplificado no console
 */
export function logSimpleAuthDiagnostic(): void {
  const diagnostic = runSimpleAuthDiagnostic();
  
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
    diagnostic.issues.forEach(issue => console.log(`- ${issue}`));
    console.groupEnd();
  }
  
  if (diagnostic.recommendations.length > 0) {
    console.group('💡 Recomendações');
    diagnostic.recommendations.forEach(rec => console.log(`- ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Alias para compatibilidade
 */
export const debugAuth = logSimpleAuthDiagnostic;