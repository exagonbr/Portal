/**
 * Detector de Loops de Requisições
 * Sistema global para detectar e registrar loops de requisições HTTP (apenas logs)
 */

interface RequestPattern {
  url: string;
  method: string;
  timestamp: number;
  headers?: Record<string, string>;
}

interface LoopDetectionConfig {
  maxRequestsPerWindow: number;
  windowMs: number;
  maxSameRequestsInSequence: number;
  sequenceWindowMs: number;
}

class RequestLoopDetector {
  private requests: RequestPattern[] = [];
  private config: LoopDetectionConfig;

  constructor(config?: Partial<LoopDetectionConfig>) {
    this.config = {
      maxRequestsPerWindow: 20,
      windowMs: 30000, // 30 segundos
      maxSameRequestsInSequence: 5,
      sequenceWindowMs: 10000, // 10 segundos
      ...config
    };
  }

  /**
   * Verifica e registra padrões de loop (apenas logs)
   */
  checkAndLogRequest(url: string, method: string = 'GET', headers?: Record<string, string>): void {
    const now = Date.now();

    // Limpar requisições antigas
    this.cleanOldRequests(now);

    // Verificar padrões de loop
    const loopDetection = this.detectLoop(url, method, now);
    if (loopDetection.isLoop) {
      console.warn('🚫 Loop de requisições detectado:', {
        url,
        method,
        reason: loopDetection.reason,
        timestamp: new Date(now).toISOString()
      });
    }

    // Registrar a requisição
    this.requests.push({
      url,
      method,
      timestamp: now,
      headers
    });
  }

  /**
   * Detecta padrões de loop
   */
  private detectLoop(url: string, method: string, now: number): {
    isLoop: boolean;
    reason?: string;
  } {
    // 1. Verificar se há muitas requisições na janela de tempo
    const recentRequests = this.requests.filter(
      req => now - req.timestamp < this.config.windowMs
    );

    if (recentRequests.length >= this.config.maxRequestsPerWindow) {
      return {
        isLoop: true,
        reason: `Muitas requisições (${recentRequests.length}) em ${this.config.windowMs / 1000} segundos`
      };
    }

    // 2. Verificar requisições idênticas em sequência
    const sameRequests = this.requests.filter(
      req => req.url === url && 
             req.method === method && 
             now - req.timestamp < this.config.sequenceWindowMs
    );

    if (sameRequests.length >= this.config.maxSameRequestsInSequence) {
      return {
        isLoop: true,
        reason: `Muitas requisições idênticas (${sameRequests.length}) para ${url} em ${this.config.sequenceWindowMs / 1000} segundos`
      };
    }

    // 3. Verificar padrão de requisições muito rápidas
    const veryRecentRequests = this.requests.filter(
      req => now - req.timestamp < 1000 // Último segundo
    );

    if (veryRecentRequests.length >= 3) {
      return {
        isLoop: true,
        reason: 'Requisições muito frequentes (3+ por segundo)'
      };
    }

    return { isLoop: false };
  }

  /**
   * Remove requisições antigas
   */
  private cleanOldRequests(now: number): void {
    const cutoff = now - Math.max(this.config.windowMs, this.config.sequenceWindowMs);
    this.requests = this.requests.filter(req => req.timestamp > cutoff);
  }

  /**
   * Força reset do detector
   */
  reset(): void {
    this.requests = [];
  }

  /**
   * Obtém estatísticas atuais
   */
  getStats(): {
    totalRequests: number;
    recentRequests: number;
  } {
    const now = Date.now();
    const recentRequests = this.requests.filter(
      req => now - req.timestamp < this.config.windowMs
    );

    return {
      totalRequests: this.requests.length,
      recentRequests: recentRequests.length
    };
  }
}

// Instância global
const globalDetector = new RequestLoopDetector();

/**
 * Interceptador de fetch para detecção automática de loops (apenas logs)
 */
export function setupRequestLoopDetection(): void {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : 
                input instanceof URL ? input.toString() : 
                input.url;
    
    const method = init?.method || 'GET';

    // Verificar e logar padrões de loop (sem bloquear)
    globalDetector.checkAndLogRequest(url, method);

    // Executar requisição normal
    try {
      return await originalFetch(input, init);
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      throw error;
    }
  };

  console.log('🔍 Detector de loops de requisições ativado (apenas logs)');
}

/**
 * Desativa a detecção de loops
 */
export function disableRequestLoopDetection(): void {
  if (typeof window === 'undefined') return;
  
  // Não há uma forma fácil de restaurar o fetch original aqui
  // pois pode ter sido sobrescrito por outros sistemas
  console.log('⚠️ Para desativar completamente, recarregue a página');
}

/**
 * Verifica padrões de loop para uma URL específica (apenas logs)
 */
export function checkRequestLoop(url: string, method: string = 'GET'): void {
  globalDetector.checkAndLogRequest(url, method);
}

/**
 * Reset manual do detector
 */
export function resetRequestLoopDetector(): void {
  globalDetector.reset();
  console.log('🔄 Detector de loops resetado');
}

/**
 * Obtém estatísticas do detector
 */
export function getRequestLoopStats() {
  return globalDetector.getStats();
}

/**
 * Configuração específica para login (apenas logs)
 */
export function setupLoginLoopProtection(): void {
  const loginDetector = new RequestLoopDetector({
    maxRequestsPerWindow: 10,
    windowMs: 60000, // 1 minuto
    maxSameRequestsInSequence: 3,
    sequenceWindowMs: 5000, // 5 segundos
  });

  // Interceptar apenas requisições de login
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : 
                input instanceof URL ? input.toString() : 
                input.url;
    
    // Aplicar detecção apenas para login (sem bloquear)
    if (url.includes('/api/auth/login')) {
      const method = init?.method || 'POST';
      loginDetector.checkAndLogRequest(url, method);
    }

    return originalFetch(input, init);
  };

  console.log('🔐 Proteção contra loops de login ativada (apenas logs)');
}

export default RequestLoopDetector; 