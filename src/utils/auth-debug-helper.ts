/**
 * Utilitário para diagnosticar e corrigir problemas de autenticação
 */

interface AuthDebugInfo {
  hasToken: boolean;
  tokenSource?: string;
  tokenType?: string;
  tokenLength?: number;
  isJWT?: boolean;
  isExpired?: boolean;
  expirationDate?: string;
  payload?: any;
}

export class AuthDebugHelper {
  /**
   * Obtém informações de debug sobre o estado de autenticação atual
   */
  static getAuthDebugInfo(): AuthDebugInfo {
    if (typeof window === 'undefined') {
      return { hasToken: false };
    }

    // Verificar todas as possíveis fontes de token
    const tokenSources = [
      'accessToken',
      'auth_token',
      'token',
      'authToken',
      'jwt'
    ];

    let foundToken: string | null = null;
    let tokenSource: string | undefined;

    // Verificar localStorage
    for (const source of tokenSources) {
      const token = localStorage.getItem(source);
      if (token) {
        foundToken = token;
        tokenSource = `localStorage.${source}`;
        break;
      }
    }

    // Verificar sessionStorage se não encontrou no localStorage
    if (!foundToken) {
      for (const source of tokenSources) {
        const token = sessionStorage.getItem(source);
        if (token) {
          foundToken = token;
          tokenSource = `sessionStorage.${source}`;
          break;
        }
      }
    }

    // Se não encontrou token
    if (!foundToken) {
      return { hasToken: false };
    }

    // Analisar o token
    const info: AuthDebugInfo = {
      hasToken: true,
      tokenSource,
      tokenType: typeof foundToken,
      tokenLength: foundToken.length
    };

    // Verificar se é JWT
    const parts = foundToken.split('.');
    info.isJWT = parts.length === 3;

    if (info.isJWT) {
      try {
        // Decodificar payload
        const payload = JSON.parse(atob(parts[1]));
        info.payload = payload;

        // Verificar expiração
        if (payload.exp) {
          const expirationDate = new Date(payload.exp * 1000);
          const now = new Date();
          info.isExpired = expirationDate < now;
          info.expirationDate = expirationDate.toISOString();
        }
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }

    return info;
  }

  /**
   * Testa uma requisição autenticada para verificar se o token é válido
   */
  static async testAuthenticatedRequest(endpoint: string = '/api/auth/me'): Promise<{
    success: boolean;
    status?: number;
    error?: string;
  }> {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Não está no ambiente do navegador' };
    }

    const info = this.getAuthDebugInfo();
    if (!info.hasToken) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      // Usar o token encontrado para fazer uma requisição de teste
      const token = localStorage.getItem(info.tokenSource?.split('.')[1] || 'accessToken');
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return {
        success: response.ok,
        status: response.status,
        error: response.ok ? undefined : `Erro ${response.status}: ${response.statusText}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro desconhecido na requisição'
      };
    }
  }

  /**
   * Executa diagnóstico completo do estado de autenticação
   */
  static async runFullDiagnostic(): Promise<{
    authInfo: AuthDebugInfo;
    testResult?: { success: boolean; status?: number; error?: string };
    recommendations: string[];
  }> {
    const authInfo = this.getAuthDebugInfo();
    const recommendations: string[] = [];

    // Verificar se há token
    if (!authInfo.hasToken) {
      recommendations.push('Faça login novamente para obter um novo token');
      return { authInfo, recommendations };
    }

    // Verificar se o token está expirado
    if (authInfo.isExpired) {
      recommendations.push('Token expirado - faça login novamente');
    }

    // Verificar se o formato é válido
    if (!authInfo.isJWT) {
      recommendations.push('Token não está no formato JWT válido - limpe o armazenamento e faça login novamente');
    }

    // Testar requisição autenticada
    const testResult = await this.testAuthenticatedRequest();
    if (!testResult.success) {
      recommendations.push(`Falha na requisição autenticada: ${testResult.error}`);
      
      if (testResult.status === 401) {
        recommendations.push('Erro 401 (Não autorizado) - faça login novamente');
      }
    }

    return {
      authInfo,
      testResult,
      recommendations
    };
  }

  /**
   * Tenta corrigir automaticamente problemas comuns de autenticação
   */
  static async autoRepairAuth(): Promise<{
    success: boolean;
    action: string;
    needsLogin: boolean;
  }> {
    const diagnostic = await this.runFullDiagnostic();
    
    // Se não há token ou está expirado, precisa de login
    if (!diagnostic.authInfo.hasToken || diagnostic.authInfo.isExpired) {
      return {
        success: false,
        action: 'Token não encontrado ou expirado',
        needsLogin: true
      };
    }

    // Se o token não é JWT válido, limpar e solicitar login
    if (!diagnostic.authInfo.isJWT) {
      this.clearAllAuthData();
      return {
        success: false,
        action: 'Token inválido removido',
        needsLogin: true
      };
    }

    // Se o teste falhou com 401, tentar refresh token
    if (diagnostic.testResult?.status === 401) {
      try {
        // Tentar refresh token se disponível
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.accessToken) {
              localStorage.setItem('accessToken', data.accessToken);
              return {
                success: true,
                action: 'Token atualizado com sucesso',
                needsLogin: false
              };
            }
          }
        }
      } catch (error) {
        console.error('Erro ao tentar refresh token:', error);
      }

      // Se chegou aqui, o refresh falhou
      return {
        success: false,
        action: 'Falha ao atualizar token',
        needsLogin: true
      };
    }

    // Se não identificou problemas específicos
    return {
      success: true,
      action: 'Nenhum problema crítico identificado',
      needsLogin: false
    };
  }

  /**
   * Limpa todos os dados de autenticação do armazenamento
   */
  static clearAllAuthData(): void {
    if (typeof window === 'undefined') return;

    // Limpar localStorage
    const localStorageKeys = [
      'accessToken',
      'auth_token',
      'token',
      'authToken',
      'jwt',
      'refreshToken',
      'user',
      'userData'
    ];

    localStorageKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpar sessionStorage
    const sessionStorageKeys = [
      'accessToken',
      'auth_token',
      'token',
      'authToken',
      'jwt'
    ];

    sessionStorageKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });

    console.log('🧹 Dados de autenticação limpos');
  }
}

// Adicionar ao objeto window para debug no console
if (typeof window !== 'undefined') {
  (window as any).AuthDebugHelper = AuthDebugHelper;
  console.log('🔧 AuthDebugHelper disponível globalmente para diagnóstico');
} 