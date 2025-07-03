/**
 * Utilitário para diagnósticos avançados de autenticação
 */

import { validateToken } from './token-validator';
import { getLoginDebugInfo } from './debug-login';

export interface AuthDiagnosticResult {
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  recommendations: string[];
  details: {
    tokenStatus: 'valid' | 'expired' | 'invalid' | 'missing';
    storageStatus: 'ok' | 'partial' | 'empty';
    networkStatus: 'unknown' | 'online' | 'offline';
    browserCompatibility: 'supported' | 'limited' | 'unsupported';
  };
  timestamp: string;
}

/**
 * Executa diagnóstico completo do sistema de autenticação
 */
export function runAuthDiagnostics(): AuthDiagnosticResult {
  const result: AuthDiagnosticResult = {
    status: 'healthy',
    issues: [],
    recommendations: [],
    details: {
      tokenStatus: 'missing',
      storageStatus: 'empty',
      networkStatus: 'unknown',
      browserCompatibility: 'supported'
    },
    timestamp: new Date().toISOString()
  };

  // Verificar ambiente
  if (typeof window === 'undefined') {
    result.status = 'error';
    result.issues.push('Executando em ambiente servidor - localStorage não disponível');
    result.recommendations.push('Execute este diagnóstico no lado cliente');
    return result;
  }

  // Verificar compatibilidade do browser
  checkBrowserCompatibility(result);

  // Verificar status do token
  checkTokenStatus(result);

  // Verificar storage
  checkStorageStatus(result);

  // Verificar conectividade de rede
  checkNetworkStatus(result);

  // Determinar status geral
  if (result.issues.length === 0) {
    result.status = 'healthy';
  } else if (result.issues.some(issue => issue.includes('crítico') || issue.includes('erro'))) {
    result.status = 'error';
  } else {
    result.status = 'warning';
  }

  return result;
}

function checkBrowserCompatibility(result: AuthDiagnosticResult): void {
  try {
    // Verificar localStorage
    if (!window.localStorage) {
      result.issues.push('LocalStorage não suportado pelo navegador');
      result.details.browserCompatibility = 'unsupported';
      result.recommendations.push('Use um navegador moderno que suporte localStorage');
      return;
    }

    // Verificar sessionStorage
    if (!window.sessionStorage) {
      result.issues.push('SessionStorage não suportado pelo navegador');
      result.details.browserCompatibility = 'limited';
      result.recommendations.push('Funcionalidade limitada - sessionStorage não disponível');
    }

    // Verificar fetch API
    if (!window.fetch) {
      result.issues.push('Fetch API não suportada pelo navegador');
      result.details.browserCompatibility = 'limited';
      result.recommendations.push('Use um navegador moderno ou adicione um polyfill para fetch');
    }

    // Verificar JSON
    if (!window.JSON) {
      result.issues.push('JSON não suportado pelo navegador');
      result.details.browserCompatibility = 'unsupported';
      result.recommendations.push('Use um navegador moderno que suporte JSON');
    }

  } catch (error) {
    result.issues.push('Erro ao verificar compatibilidade do navegador');
    result.details.browserCompatibility = 'unsupported';
  }
}

function checkTokenStatus(result: AuthDiagnosticResult): void {
  try {
    const debugInfo = getLoginDebugInfo();
    
    if (!debugInfo.hasToken) {
      result.details.tokenStatus = 'missing';
      result.issues.push('Nenhum token de autenticação encontrado');
      result.recommendations.push('Faça login para obter um token válido');
      return;
    }

    if (debugInfo.tokenExpired) {
      result.details.tokenStatus = 'expired';
      result.issues.push('Token de autenticação expirado');
      result.recommendations.push('Faça login novamente para renovar o token');
      return;
    }

    if (!debugInfo.tokenValid) {
      result.details.tokenStatus = 'invalid';
      result.issues.push('Token de autenticação inválido');
      result.recommendations.push('Limpe os dados de autenticação e faça login novamente');
      return;
    }

    result.details.tokenStatus = 'valid';
    
    // Verificar se o token está próximo do vencimento
    if (debugInfo.tokenPayload?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = debugInfo.tokenPayload.exp - now;
      
      if (timeUntilExpiry < 300) { // Menos de 5 minutos
        result.issues.push('Token expirará em breve (menos de 5 minutos)');
        result.recommendations.push('Considere renovar o token em breve');
      }
    }

  } catch (error) {
    result.issues.push('Erro ao verificar status do token');
    result.details.tokenStatus = 'invalid';
  }
}

function checkStorageStatus(result: AuthDiagnosticResult): void {
  try {
    const debugInfo = getLoginDebugInfo();
    let storageItems = 0;

    // Contar itens no localStorage
    if (debugInfo.localStorage.accessToken) storageItems++;
    if (debugInfo.localStorage.refreshToken) storageItems++;

    // Contar itens no sessionStorage
    if (debugInfo.sessionStorage.accessToken) storageItems++;
    if (debugInfo.sessionStorage.refreshToken) storageItems++;

    if (storageItems === 0) {
      result.details.storageStatus = 'empty';
      result.issues.push('Nenhum dado de autenticação encontrado no storage');
    } else if (storageItems < 2) {
      result.details.storageStatus = 'partial';
      result.issues.push('Dados de autenticação incompletos no storage');
      result.recommendations.push('Verifique se todos os tokens foram salvos corretamente');
    } else {
      result.details.storageStatus = 'ok';
    }

    // Testar se consegue escrever no localStorage
    try {
      const testKey = '__auth_diagnostic_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (error) {
      result.issues.push('Não é possível escrever no localStorage');
      result.recommendations.push('Verifique se o localStorage não está cheio ou bloqueado');
    }

  } catch (error) {
    result.issues.push('Erro ao verificar status do storage');
    result.details.storageStatus = 'empty';
  }
}

function checkNetworkStatus(result: AuthDiagnosticResult): void {
  try {
    if (navigator.onLine !== undefined) {
      result.details.networkStatus = navigator.onLine ? 'online' : 'offline';
      
      if (!navigator.onLine) {
        result.issues.push('Dispositivo está offline');
        result.recommendations.push('Verifique sua conexão com a internet');
      }
    } else {
      result.details.networkStatus = 'unknown';
    }
  } catch (error) {
    result.details.networkStatus = 'unknown';
  }
}

/**
 * Imprime o resultado do diagnóstico no console
 */
export function logAuthDiagnostics(): void {
  const result = runAuthDiagnostics();
  
  console.group('🏥 Diagnóstico de Autenticação');
  console.log('📊 Status Geral:', result.status.toUpperCase());
  console.log('📅 Timestamp:', result.timestamp);
  
  console.group('📋 Detalhes');
  console.log('🔑 Token:', result.details.tokenStatus);
  console.log('💾 Storage:', result.details.storageStatus);
  console.log('🌐 Rede:', result.details.networkStatus);
  console.log('🌍 Navegador:', result.details.browserCompatibility);
  console.groupEnd();
  
  if (result.issues.length > 0) {
    console.group('⚠️ Problemas Encontrados');
    result.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    console.groupEnd();
  }
  
  if (result.recommendations.length > 0) {
    console.group('💡 Recomendações');
    result.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Gera relatório de diagnóstico em formato texto
 */
export function generateDiagnosticReport(): string {
  const result = runAuthDiagnostics();
  
  let report = `RELATÓRIO DE DIAGNÓSTICO DE AUTENTICAÇÃO\n`;
  report += `=========================================\n\n`;
  report += `Status Geral: ${result.status.toUpperCase()}\n`;
  report += `Timestamp: ${result.timestamp}\n\n`;
  
  report += `DETALHES:\n`;
  report += `---------\n`;
  report += `Token: ${result.details.tokenStatus}\n`;
  report += `Storage: ${result.details.storageStatus}\n`;
  report += `Rede: ${result.details.networkStatus}\n`;
  report += `Navegador: ${result.details.browserCompatibility}\n\n`;
  
  if (result.issues.length > 0) {
    report += `PROBLEMAS ENCONTRADOS:\n`;
    report += `----------------------\n`;
    result.issues.forEach((issue, index) => {
      report += `${index + 1}. ${issue}\n`;
    });
    report += `\n`;
  }
  
  if (result.recommendations.length > 0) {
    report += `RECOMENDAÇÕES:\n`;
    report += `--------------\n`;
    result.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += `\n`;
  }
  
  return report;
}