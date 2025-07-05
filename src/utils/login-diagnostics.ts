/**
 * Utilitário para diagnosticar problemas de login e redirecionamento
 */

import { getDashboardPath } from './roleRedirect';

export interface LoginDiagnostics {
  timestamp: string;
  step: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  data?: any;
}

class LoginDiagnosticsManager {
  private logs: LoginDiagnostics[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  log(step: string, status: LoginDiagnostics['status'], message: string, data?: any) {
    if (!this.isEnabled) return;

    const diagnostic: LoginDiagnostics = {
      timestamp: new Date().toISOString(),
      step,
      status,
      message,
      data
    };

    this.logs.push(diagnostic);

    // Manter apenas os últimos 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(-50);
    }

    // Log no console com emoji baseado no status
    const emoji = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: '🔍'
    }[status];

    console.log(`${emoji} [LOGIN-DIAG] ${step}: ${message}`, data || '');
  }

  success(step: string, message: string, data?: any) {
    this.log(step, 'success', message, data);
  }

  error(step: string, message: string, data?: any) {
    this.log(step, 'error', message, data);
  }

  warning(step: string, message: string, data?: any) {
    this.log(step, 'warning', message, data);
  }

  info(step: string, message: string, data?: any) {
    this.log(step, 'info', message, data);
  }

  getLogs(): LoginDiagnostics[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    console.log('🧹 [LOGIN-DIAG] Logs limpos');
  }

  generateReport() {
    if (!this.isEnabled) return;

    console.group('📊 [LOGIN-DIAG] Relatório de Diagnóstico');
    
    if (this.logs.length === 0) {
      console.log('Nenhum log de diagnóstico encontrado');
      console.groupEnd();
      return;
    }

    console.log(`Total de logs: ${this.logs.length}`);

    // Agrupar por status
    const byStatus = this.logs.reduce((acc, log) => {
      acc[log.status] = (acc[log.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Logs por status:', byStatus);

    // Mostrar últimos 20 logs
    console.log('Últimos 20 logs:');
    this.logs.slice(-20).forEach((log, index) => {
      const emoji = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: '🔍'
      }[log.status];
      
      console.log(`${index + 1}. ${log.timestamp.split('T')[1].split('.')[0]} ${emoji} ${log.step}: ${log.message}`);
    });

    console.groupEnd();
  }

  /**
   * Diagnóstico completo do fluxo de login
   */
  async diagnoseLoginFlow(email: string, password: string) {
    this.info('INICIO', 'Iniciando diagnóstico do fluxo de login');

    try {
      // 1. Verificar API de login
      this.info('API-LOGIN', 'Testando API de login');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.success('API-LOGIN', 'Login API respondeu com sucesso', {
          status: response.status,
          hasToken: !!data.data?.accessToken,
          hasUser: !!data.data?.user
        });

        // 2. Verificar token
        if (data.data?.accessToken) {
          this.info('TOKEN-DECODE', 'Verificando token JWT');
          
          try {
            const parts = data.data.accessToken.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              this.success('TOKEN-DECODE', 'Token decodificado com sucesso', {
                id: payload.id,
                email: payload.email,
                role: payload.role,
                exp: payload.exp
              });

              // 3. Verificar dashboard path
              const dashboardPath = getDashboardPath(payload.role);
              if (dashboardPath) {
                this.success('DASHBOARD-PATH', 'Dashboard path encontrado', {
                  role: payload.role,
                  path: dashboardPath
                });
              } else {
                this.error('DASHBOARD-PATH', 'Dashboard path não encontrado', {
                  role: payload.role,
                  availablePaths: Object.keys(require('./roleRedirect').ROLE_DASHBOARD_MAP)
                });
              }
            } else {
              this.error('TOKEN-DECODE', 'Token não tem formato JWT válido', {
                parts: parts.length
              });
            }
          } catch (error) {
            this.error('TOKEN-DECODE', 'Erro ao decodificar token', error);
          }
        } else {
          this.error('API-LOGIN', 'Token não retornado pela API');
        }
      } else {
        this.error('API-LOGIN', 'Falha na API de login', {
          status: response.status,
          message: data.message
        });
      }
    } catch (error) {
      this.error('API-LOGIN', 'Erro na requisição de login', error);
    }

    this.info('FIM', 'Diagnóstico do fluxo de login concluído');
    this.generateReport();
  }

  /**
   * Diagnóstico do estado atual da autenticação
   */
  diagnoseCurrentState() {
    this.info('CURRENT-STATE', 'Diagnosticando estado atual');

    // Verificar localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.info('LOCALSTORAGE', 'Token encontrado no localStorage', {
        length: token.length,
        preview: token.substring(0, 50) + '...'
      });

      // Verificar se é válido
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const isExpired = payload.exp && payload.exp * 1000 < Date.now();
          
          if (isExpired) {
            this.warning('TOKEN-EXPIRED', 'Token expirado', {
              exp: new Date(payload.exp * 1000).toISOString()
            });
          } else {
            this.success('TOKEN-VALID', 'Token válido', {
              role: payload.role,
              exp: new Date(payload.exp * 1000).toISOString()
            });
          }
        } else {
          this.error('TOKEN-FORMAT', 'Token com formato inválido', {
            parts: parts.length
          });
        }
      } catch (error) {
        this.error('TOKEN-PARSE', 'Erro ao parsear token', error);
      }
    } else {
      this.warning('LOCALSTORAGE', 'Nenhum token encontrado no localStorage');
    }

    // Verificar URL atual
    this.info('URL-CURRENT', 'URL atual', {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search
    });

    // Verificar se está na página de login
    if (window.location.pathname.includes('/login') || window.location.pathname.includes('/auth')) {
      this.info('URL-LOGIN', 'Usuário está na página de login');
    } else {
      this.info('URL-OTHER', 'Usuário não está na página de login');
    }
  }
}

// Instância singleton
export const loginDiagnostics = new LoginDiagnosticsManager();

// Tornar disponível globalmente em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).loginDiagnostics = loginDiagnostics;
  (window as any).diagnoseLogin = () => loginDiagnostics.diagnoseLoginFlow('admin@sistema.com', 'admin123');
  (window as any).diagnoseCurrentState = () => loginDiagnostics.diagnoseCurrentState();
}

/**
 * Hook para usar diagnósticos em componentes React
 */
export const useLoginDiagnostics = () => {
  return {
    success: loginDiagnostics.success.bind(loginDiagnostics),
    error: loginDiagnostics.error.bind(loginDiagnostics),
    warning: loginDiagnostics.warning.bind(loginDiagnostics),
    info: loginDiagnostics.info.bind(loginDiagnostics),
    getLogs: loginDiagnostics.getLogs.bind(loginDiagnostics),
    clearLogs: loginDiagnostics.clearLogs.bind(loginDiagnostics),
    generateReport: loginDiagnostics.generateReport.bind(loginDiagnostics),
    diagnoseLoginFlow: loginDiagnostics.diagnoseLoginFlow.bind(loginDiagnostics),
    diagnoseCurrentState: loginDiagnostics.diagnoseCurrentState.bind(loginDiagnostics)
  };
}; 