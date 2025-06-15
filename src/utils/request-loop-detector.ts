/**
 * Detector de Loops de Requisições
 * Sistema global para detectar e prevenir loops de requisições HTTP
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
  cooldownMs: number;
}

class RequestLoopDetector {
  private requests: RequestPattern[] = [];
  private blockedUntil: number = 0;
  private config: LoopDetectionConfig;

  constructor(config?: Partial<LoopDetectionConfig>) {
    this.config = {
      maxRequestsPerWindow: 20,
      windowMs: 30000, // 30 segundos
      maxSameRequestsInSequence: 5,
      sequenceWindowMs: 10000, // 10 segundos
      cooldownMs: 30000, // 30 segundos de cooldown
      ...config
    };
  }

  /**
   * Verifica se uma requisição deve ser bloqueada
   */
  shouldBlockRequest(url: string, method: string = 'GET', headers?: Record<string, string>): {
    blocked: boolean;
    reason?: string;
    retryAfter?: number;
  } {
    const now = Date.now();

    // Verificar se ainda estamos em cooldown
    if (now < this.blockedUntil) {
      const retryAfter = Math.ceil((this.blockedUntil - now) / 1000);
      return {
        blocked: true,
        reason: 'Sistema em cooldown devido a loop detectado',
        retryAfter
      };
    }

    // Limpar requisições antigas
    this.cleanOldRequests(now);

    // Verificar padrões de loop
    const loopDetection = this.detectLoop(url, method, now);
    if (loopDetection.isLoop) {
      this.blockedUntil = now + this.config.cooldownMs;
      return {
        blocked: true,
        reason: loopDetection.reason,
        retryAfter: Math.ceil(this.config.cooldownMs / 1000)
      };
    }

    // Registrar a requisição
    this.requests.push({
      url,
      method,
      timestamp: now,
      headers
    });

    return { blocked: false };
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

    // 4. Verificar padrão específico de login
    if (url.includes('/api/auth/login')) {
      const loginRequests = this.requests.filter(
        req => req.url.includes('/api/auth/login') && 
               now - req.timestamp < 60000 // Último minuto
      );

      if (loginRequests.length >= 8) {
        return {
          isLoop: true,
          reason: `Muitas tentativas de login (${loginRequests.length}) no último minuto`
        };
      }
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
    this.blockedUntil = 0;
  }

  /**
   * Obtém estatísticas atuais
   */
  getStats(): {
    totalRequests: number;
    recentRequests: number;
    isBlocked: boolean;
    blockedUntil?: Date;
  } {
    const now = Date.now();
    const recentRequests = this.requests.filter(
      req => now - req.timestamp < this.config.windowMs
    );

    return {
      totalRequests: this.requests.length,
      recentRequests: recentRequests.length,
      isBlocked: now < this.blockedUntil,
      blockedUntil: this.blockedUntil > 0 ? new Date(this.blockedUntil) : undefined
    };
  }
}

// Instância global
const globalDetector = new RequestLoopDetector();

/**
 * Interceptador de fetch para detecção automática de loops
 */
export function setupRequestLoopDetection(): void {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : 
                input instanceof URL ? input.toString() : 
                input.url;
    
    const method = init?.method || 'GET';

    // Verificar se deve bloquear a requisição
    const blockCheck = globalDetector.shouldBlockRequest(url, method);
    
    if (blockCheck.blocked) {
      console.warn('🚫 Requisição bloqueada pelo detector de loops:', {
        url,
        method,
        reason: blockCheck.reason,
        retryAfter: blockCheck.retryAfter
      });

      // Criar resposta de erro simulada
      const errorResponse = new Response(
        JSON.stringify({
          success: false,
          message: blockCheck.reason,
          retryAfter: blockCheck.retryAfter,
          isLoop: true
        }),
        {
          status: 429,
          statusText: 'Too Many Requests',
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': blockCheck.retryAfter?.toString() || '30'
          }
        }
      );

      return errorResponse;
    }

    // Executar requisição normal
    try {
      return await originalFetch(input, init);
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      throw error;
    }
  };

  console.log('🔍 Detector de loops de requisições ativado');
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
 * Verifica se uma URL específica deve ser bloqueada
 */
export function checkRequestBlocked(url: string, method: string = 'GET'): {
  blocked: boolean;
  reason?: string;
  retryAfter?: number;
} {
  return globalDetector.shouldBlockRequest(url, method);
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
 * Configuração específica para login
 */
export function setupLoginLoopProtection(): void {
  const loginDetector = new RequestLoopDetector({
    maxRequestsPerWindow: 10,
    windowMs: 60000, // 1 minuto
    maxSameRequestsInSequence: 3,
    sequenceWindowMs: 5000, // 5 segundos
    cooldownMs: 60000 // 1 minuto de cooldown
  });

  // Interceptar apenas requisições de login
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : 
                input instanceof URL ? input.toString() : 
                input.url;
    
    // Aplicar proteção apenas para login
    if (url.includes('/api/auth/login')) {
      const method = init?.method || 'POST';
      const blockCheck = loginDetector.shouldBlockRequest(url, method);
      
      if (blockCheck.blocked) {
        console.warn('🚫 Login bloqueado pelo detector de loops:', blockCheck.reason);
        
        return new Response(
          JSON.stringify({
            success: false,
            message: blockCheck.reason,
            retryAfter: blockCheck.retryAfter,
            isLoop: true
          }),
          {
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': blockCheck.retryAfter?.toString() || '60'
            }
          }
        );
      }
    }

    return originalFetch(input, init);
  };

  console.log('🔐 Proteção contra loops de login ativada');
}

export default RequestLoopDetector; 