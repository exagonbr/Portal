/**
 * Utilitário de Debug para Erros HTTP 500
 * Ajuda a diagnosticar problemas de conectividade entre frontend e backend
 */

interface Http500ErrorLog {
  timestamp: number;
  url: string;
  method: string;
  endpoint: string;
  status: number;
  error: any;
  responseText: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
}

class Http500Debugger {
  private errors: Http500ErrorLog[] = [];
  private maxErrors = 20;

  /**
   * Registra um erro HTTP 500
   */
  logError(details: Omit<Http500ErrorLog, 'timestamp'>) {
    const errorLog: Http500ErrorLog = {
      ...details,
      timestamp: Date.now()
    };

    this.errors.push(errorLog);

    // Manter apenas os últimos erros
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log detalhado no console
    console.group('🚨 [HTTP-500-DEBUG] Erro HTTP 500 detectado');
    console.error('Timestamp:', new Date(errorLog.timestamp).toISOString());
    console.error('URL:', errorLog.url);
    console.error('Method:', errorLog.method);
    console.error('Endpoint:', errorLog.endpoint);
    console.error('Status:', errorLog.status);
    console.error('Error:', errorLog.error);
    console.error('Response Text:', errorLog.responseText);
    if (errorLog.requestHeaders) {
      console.error('Request Headers:', errorLog.requestHeaders);
    }
    if (errorLog.responseHeaders) {
      console.error('Response Headers:', errorLog.responseHeaders);
    }
    console.groupEnd();

    // Detectar padrões
    this.detectPatterns();
  }

  /**
   * Detecta padrões nos erros
   */
  private detectPatterns() {
    if (this.errors.length < 3) return;

    const recentErrors = this.errors.slice(-3);
    const lastError = recentErrors[recentErrors.length - 1];

    // Verificar se o mesmo endpoint está failando repetidamente
    const sameEndpoint = recentErrors.every(err => err.endpoint === lastError.endpoint);
    const sameMethod = recentErrors.every(err => err.method === lastError.method);

    if (sameEndpoint && sameMethod) {
      console.warn(`🚨 [HTTP-500-DEBUG] PADRÃO DETECTADO: ${lastError.method} ${lastError.endpoint} falhou 3 vezes recentemente!`);
      
      // Sugerir possíveis soluções
      this.suggestSolutions(lastError);
    }

    // Verificar se há muitos erros em pouco tempo
    const now = Date.now();
    const errorsInLastMinute = this.errors.filter(err => now - err.timestamp < 60000);
    
    if (errorsInLastMinute.length >= 5) {
      console.warn('🚨 [HTTP-500-DEBUG] ALERTA: Muitos erros HTTP 500 no último minuto!');
      console.warn('🚨 [HTTP-500-DEBUG] Possível problema de conectividade ou sobrecarga do servidor');
    }
  }

  /**
   * Sugere soluções baseadas no padrão de erro
   */
  private suggestSolutions(error: Http500ErrorLog) {
    console.group('💡 [HTTP-500-DEBUG] Sugestões de solução');

    if (error.endpoint.includes('/api/settings')) {
      console.log('• Verificar se o backend está rodando na porta correta');
      console.log('• Verificar configurações de CORS');
      console.log('• Verificar se as variáveis de ambiente estão configuradas');
      console.log('• Verificar conectividade com banco de dados');
    }

    if (error.endpoint.includes('test-email')) {
      console.log('• Verificar configurações SMTP no backend');
      console.log('• Verificar se as credenciais de email estão corretas');
      console.log('• Verificar se o serviço de email está inicializado');
    }

    if (error.responseText.includes('ECONNREFUSED')) {
      console.log('• Backend não está rodando ou não está acessível');
      console.log('• Verificar se a porta está correta');
      console.log('• Verificar firewall e configurações de rede');
    }

    if (error.responseText.includes('timeout')) {
      console.log('• Aumentar timeout das requisições');
      console.log('• Verificar performance do servidor');
      console.log('• Verificar consultas de banco de dados lentas');
    }

    console.groupEnd();
  }

  /**
   * Retorna estatísticas dos erros
   */
  getStats() {
    const now = Date.now();
    const last24h = this.errors.filter(err => now - err.timestamp < 24 * 60 * 60 * 1000);
    const lastHour = this.errors.filter(err => now - err.timestamp < 60 * 60 * 1000);
    const lastMinute = this.errors.filter(err => now - err.timestamp < 60 * 1000);

    // Agrupar por endpoint
    const byEndpoint = this.errors.reduce((acc, err) => {
      acc[err.endpoint] = (acc[err.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Agrupar por método
    const byMethod = this.errors.reduce((acc, err) => {
      acc[err.method] = (acc[err.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errors.length,
      last24h: last24h.length,
      lastHour: lastHour.length,
      lastMinute: lastMinute.length,
      byEndpoint,
      byMethod,
      mostRecentError: this.errors[this.errors.length - 1],
      oldestError: this.errors[0]
    };
  }

  /**
   * Retorna todos os erros registrados
   */
  getAllErrors() {
    return [...this.errors];
  }

  /**
   * Limpa todos os erros registrados
   */
  clearErrors() {
    this.errors = [];
    console.log('🧹 [HTTP-500-DEBUG] Histórico de erros limpo');
  }

  /**
   * Testa conectividade com o backend
   */
  async testConnectivity() {
    console.log('🔍 [HTTP-500-DEBUG] Testando conectividade com backend...');

    const endpoints = [
      '/api/settings/public',
      '/api/health',
      '/api/status'
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        results.push({
          endpoint,
          status: response.status,
          ok: response.ok,
          responseTime,
          error: null
        });

        console.log(`✅ ${endpoint}: ${response.status} (${responseTime}ms)`);
      } catch (error) {
        results.push({
          endpoint,
          status: 0,
          ok: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : String(error)
        });

        console.log(`❌ ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return results;
  }

  /**
   * Gera relatório de diagnóstico
   */
  generateDiagnosticReport() {
    const stats = this.getStats();
    
    console.group('📊 [HTTP-500-DEBUG] Relatório de Diagnóstico');
    console.log('Total de erros registrados:', stats.total);
    console.log('Erros nas últimas 24h:', stats.last24h);
    console.log('Erros na última hora:', stats.lastHour);
    console.log('Erros no último minuto:', stats.lastMinute);
    console.log('Erros por endpoint:', stats.byEndpoint);
    console.log('Erros por método:', stats.byMethod);
    
    if (stats.mostRecentError) {
      console.log('Erro mais recente:', {
        timestamp: new Date(stats.mostRecentError.timestamp).toISOString(),
        endpoint: stats.mostRecentError.endpoint,
        method: stats.mostRecentError.method,
        error: stats.mostRecentError.error
      });
    }
    
    console.groupEnd();

    return stats;
  }
}

// Instância singleton
export const http500Debugger = new Http500Debugger();

// Função helper para uso fácil
export const logHttp500Error = (
  url: string,
  method: string,
  endpoint: string,
  status: number,
  error: any,
  responseText: string,
  requestHeaders?: Record<string, string>,
  responseHeaders?: Record<string, string>
) => {
  http500Debugger.logError({
    url,
    method,
    endpoint,
    status,
    error,
    responseText,
    requestHeaders,
    responseHeaders
  });
};

// Expor no window para debug manual
if (typeof window !== 'undefined') {
  (window as any).http500Debugger = http500Debugger;
}

export default http500Debugger; 