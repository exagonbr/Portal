/**
 * Utilitário para debugar problemas de autenticação
 */

export interface AuthDebugInfo {
  hasToken: boolean;
  tokenSource: string | null;
  tokenPreview: string | null;
  tokenLength: number;
  isJWT: boolean;
  jwtPayload?: any;
  isExpired?: boolean;
  storageState: {
    localStorage: Record<string, boolean>;
    sessionStorage: Record<string, boolean>;
    cookies: string[];
  };
  apiClientState?: {
    hasToken: boolean;
    tokenPreview: string | null;
  };
}

export class AuthDebugHelper {
  /**
   * Coleta informações completas sobre o estado da autenticação
   */
  static getAuthDebugInfo(): AuthDebugInfo {
    const info: AuthDebugInfo = {
      hasToken: false,
      tokenSource: null,
      tokenPreview: null,
      tokenLength: 0,
      isJWT: false,
      storageState: {
        localStorage: {},
        sessionStorage: {},
        cookies: []
      }
    };

    if (typeof window === 'undefined') {
      console.log('🔍 AuthDebugHelper: Executando no servidor, informações limitadas');
      return info;
    }

    // 1. Verificar localStorage
    const localStorageKeys = ['auth_token', 'token', 'authToken'];
    localStorageKeys.forEach(key => {
      const value = localStorage.getItem(key);
      info.storageState.localStorage[key] = !!value;
      
      if (value && !info.hasToken) {
        info.hasToken = true;
        info.tokenSource = `localStorage.${key}`;
        info.tokenPreview = value.substring(0, 20) + '...';
        info.tokenLength = value.length;
        info.isJWT = value.includes('.') && value.split('.').length === 3;
        
        if (info.isJWT) {
          try {
            const parts = value.split('.');
            const payload = JSON.parse(atob(parts[1]));
            info.jwtPayload = payload;
            info.isExpired = payload.exp ? payload.exp < Math.floor(Date.now() / 1000) : false;
          } catch (e) {
            console.warn('🔍 Erro ao decodificar JWT:', e);
          }
        }
      }
    });

    // 2. Verificar sessionStorage se não encontrou no localStorage
    if (!info.hasToken) {
      localStorageKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        info.storageState.sessionStorage[key] = !!value;
        
        if (value && !info.hasToken) {
          info.hasToken = true;
          info.tokenSource = `sessionStorage.${key}`;
          info.tokenPreview = value.substring(0, 20) + '...';
          info.tokenLength = value.length;
          info.isJWT = value.includes('.') && value.split('.').length === 3;
        }
      });
    }

    // 3. Verificar cookies se não encontrou nos storages
    if (!info.hasToken) {
      const cookies = document.cookie.split(';');
      info.storageState.cookies = cookies.map(c => c.trim().split('=')[0]);
      
      const cookieKeys = ['auth_token', 'token', 'authToken'];
      cookieKeys.forEach(key => {
        const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
        if (cookie && !info.hasToken) {
          const value = cookie.split('=')[1];
          info.hasToken = true;
          info.tokenSource = `cookie.${key}`;
          info.tokenPreview = value.substring(0, 20) + '...';
          info.tokenLength = value.length;
          info.isJWT = value.includes('.') && value.split('.').length === 3;
        }
      });
    }

    // 4. Verificar API Client se disponível
    try {
      if ((window as any).apiClient) {
        const apiToken = (window as any).apiClient.getAuthToken();
        info.apiClientState = {
          hasToken: !!apiToken,
          tokenPreview: apiToken ? apiToken.substring(0, 20) + '...' : null
        };
      }
    } catch (e) {
      console.warn('🔍 Erro ao verificar API Client:', e);
    }

    return info;
  }

  /**
   * Testa uma requisição autenticada para verificar se o token funciona
   */
  static async testAuthenticatedRequest(endpoint: string = '/api/auth/validate'): Promise<{
    success: boolean;
    status: number;
    response?: any;
    error?: string;
  }> {
    try {
      const info = this.getAuthDebugInfo();
      
      if (!info.hasToken) {
        return {
          success: false,
          status: 0,
          error: 'Nenhum token encontrado para teste'
        };
      }

      const token = this.getCurrentToken();
      if (!token) {
        return {
          success: false,
          status: 0,
          error: 'Não foi possível obter token para teste'
        };
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const responseData = await response.json();

      return {
        success: response.ok,
        status: response.status,
        response: responseData
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém o token atual seguindo a mesma lógica do API Client
   */
  static getCurrentToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    // Tentar obter token de localStorage com prioridade
    const possibleKeys = ['auth_token', 'token', 'authToken'];
    
    for (const key of possibleKeys) {
      const storedToken = localStorage.getItem(key);
      if (storedToken && storedToken.trim() !== '') {
        return storedToken.trim();
      }
    }

    // Se não encontrar no localStorage, tentar sessionStorage
    for (const key of possibleKeys) {
      const storedToken = sessionStorage.getItem(key);
      if (storedToken && storedToken.trim() !== '') {
        return storedToken.trim();
      }
    }

    // Se não encontrar nos storages, tentar obter dos cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (['auth_token', 'token', 'authToken'].includes(name) && value && value.trim() !== '') {
        return value.trim();
      }
    }

    return null;
  }

  /**
   * Limpa todos os dados de autenticação
   */
  static clearAllAuthData(): void {
    if (typeof window === 'undefined') {
      return;
    }

    console.log('🧹 Limpando todos os dados de autenticação...');

    // Limpar localStorage
    const localStorageKeys = ['auth_token', 'token', 'authToken', 'user', 'user_session', 'userSession'];
    localStorageKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    // Limpar sessionStorage
    localStorageKeys.forEach(key => {
      sessionStorage.removeItem(key);
    });

    // Limpar cookies
    const cookiesToClear = ['auth_token', 'token', 'authToken', 'user_data', 'session_token', 'refresh_token', 'session_id'];
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });

    console.log('✅ Dados de autenticação limpos');
  }

  /**
   * Gera um relatório completo de debug
   */
  static generateDebugReport(): string {
    const info = this.getAuthDebugInfo();
    
    let report = '🔍 RELATÓRIO DE DEBUG DE AUTENTICAÇÃO\n';
    report += '=' .repeat(50) + '\n\n';
    
    report += `🔐 TOKEN:\n`;
    report += `  ✅ Tem token: ${info.hasToken}\n`;
    report += `  📍 Fonte: ${info.tokenSource || 'nenhuma'}\n`;
    report += `  📏 Tamanho: ${info.tokenLength} caracteres\n`;
    report += `  🔑 É JWT: ${info.isJWT}\n`;
    
    if (info.isJWT && info.jwtPayload) {
      report += `  👤 Usuário: ${info.jwtPayload.email || 'N/A'}\n`;
      report += `  🏷️ Role: ${info.jwtPayload.role || 'N/A'}\n`;
      report += `  ⏰ Expiração: ${info.jwtPayload.exp ? new Date(info.jwtPayload.exp * 1000).toLocaleString() : 'N/A'}\n`;
      report += `  ❌ Expirado: ${info.isExpired || false}\n`;
    }
    
    report += `\n📦 ARMAZENAMENTO:\n`;
    report += `  LocalStorage:\n`;
    Object.entries(info.storageState.localStorage).forEach(([key, hasValue]) => {
      report += `    ${hasValue ? '✅' : '❌'} ${key}\n`;
    });
    
    report += `  SessionStorage:\n`;
    Object.entries(info.storageState.sessionStorage).forEach(([key, hasValue]) => {
      report += `    ${hasValue ? '✅' : '❌'} ${key}\n`;
    });
    
    report += `  Cookies: ${info.storageState.cookies.join(', ') || 'nenhum'}\n`;
    
    if (info.apiClientState) {
      report += `\n🔧 API CLIENT:\n`;
      report += `  ✅ Tem token: ${info.apiClientState.hasToken}\n`;
      report += `  📍 Preview: ${info.apiClientState.tokenPreview || 'nenhum'}\n`;
    }
    
    return report;
  }

  /**
   * Executa diagnóstico completo e exibe no console
   */
  static async runFullDiagnostic(): Promise<void> {
    console.log('🔍 Iniciando diagnóstico completo de autenticação...\n');
    
    // 1. Relatório básico
    const report = this.generateDebugReport();
    console.log(report);
    
    // 2. Teste de requisição
    console.log('\n🌐 Testando requisição autenticada...');
    const testResult = await this.testAuthenticatedRequest();
    
    console.log(`📡 Status: ${testResult.status}`);
    console.log(`✅ Sucesso: ${testResult.success}`);
    
    if (testResult.error) {
      console.log(`❌ Erro: ${testResult.error}`);
    }
    
    if (testResult.response) {
      console.log('📋 Resposta:', testResult.response);
    }
    
    // 3. Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    const info = this.getAuthDebugInfo();
    
    if (!info.hasToken) {
      console.log('❌ Nenhum token encontrado - faça login novamente');
    } else if (info.isExpired) {
      console.log('⏰ Token expirado - faça login novamente');
    } else if (!testResult.success) {
      console.log('🔧 Token encontrado mas inválido - limpe cache e faça login novamente');
    } else {
      console.log('✅ Autenticação funcionando corretamente');
    }
    
    console.log('\n✅ Diagnóstico concluído!');
  }
}

// Exportar para uso global no console
if (typeof window !== 'undefined') {
  (window as any).AuthDebugHelper = AuthDebugHelper;
}

export default AuthDebugHelper; 