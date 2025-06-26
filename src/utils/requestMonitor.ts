interface RequestInfo {
  url: string;
  method: string;
  timestamp: number;
  count: number;
}

class RequestMonitor {
  private requests: Map<string, RequestInfo[]> = new Map();
  private readonly MAX_REQUESTS_PER_WINDOW = 50; // Aumentado de 10 para 50
  private readonly TIME_WINDOW = 30000; // 30 segundos
  private readonly DISABLED = true; // Temporariamente desabilitado

  /**
   * Verifica se uma requisição deve ser bloqueada por excesso de chamadas
   */
  shouldBlockRequest(url: string, method: string = 'GET'): boolean {
    // Temporariamente desabilitado para evitar falsos positivos
    if (this.DISABLED) {
      return false;
    }

    // Ignorar URLs específicas que são seguras
    const safeUrls = [
      '/api/tv-shows',
      '/api/auth/validate',
      '/api/users/me',
      '/api/cache',
    ];

    if (safeUrls.some(safeUrl => url.includes(safeUrl))) {
      return false;
    }

    const key = `${method}:${url}`;
    const now = Date.now();
    
    // Obter ou criar array de requisições para esta chave
    let requestHistory = this.requests.get(key) || [];
    
    // Remover requisições antigas (fora da janela de tempo)
    requestHistory = requestHistory.filter(
      req => now - req.timestamp < this.TIME_WINDOW
    );
    
    // Verificar se excedeu o limite
    if (requestHistory.length >= this.MAX_REQUESTS_PER_WINDOW) {
      console.warn(`🚨 Loop de requisições detectado: ${method} ${url}`, {
        count: requestHistory.length,
        timeWindow: this.TIME_WINDOW / 1000,
        requests: requestHistory
      });
      
      // Reportar para análise
      this.reportLoop(url, method, requestHistory.length);
      
      return true;
    }
    
    // Adicionar esta requisição ao histórico
    requestHistory.push({
      url,
      method,
      timestamp: now,
      count: requestHistory.length + 1
    });
    
    // Atualizar o mapa
    this.requests.set(key, requestHistory);
    
    return false;
  }

  /**
   * Reporta um loop detectado (pode ser usado para logging, analytics, etc.)
   */
  private reportLoop(url: string, method: string, count: number): void {
    const report = {
      url,
      method,
      reason: `Muitas requisições (${count}) em ${this.TIME_WINDOW / 1000} segundos`,
      timestamp: new Date().toISOString()
    };
    
    console.error('Loop de requisições detectado:', report);
    
    // Aqui você pode adicionar código para enviar o relatório para um serviço de monitoramento
    // Por exemplo: enviar para analytics, Sentry, etc.
  }

  /**
   * Limpa o histórico de requisições (útil para testes ou reset)
   */
  clearHistory(): void {
    this.requests.clear();
  }

  /**
   * Obtém estatísticas das requisições
   */
  getStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    this.requests.forEach((history, key) => {
      stats[key] = history.length;
    });
    
    return stats;
  }

  /**
   * Habilita ou desabilita o monitor
   */
  setEnabled(enabled: boolean): void {
    (this as any).DISABLED = !enabled;
  }
}

// Singleton instance
const requestMonitor = new RequestMonitor();

export default requestMonitor; 