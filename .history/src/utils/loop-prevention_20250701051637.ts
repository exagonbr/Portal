/**
 * Sistema de Prevenção de Loops - Frontend
 * Previne loops de requisições de forma definitiva
 */

interface RequestRecord {
  url: string;
  timestamp: number;
  method: string;
  status?: number;
}

interface LoopDetector {
  requests: RequestRecord[];
  blockedUntil: Map<string, number>;
  consecutiveErrors: Map<string, number>;
}

class LoopPreventionSystem {
  private detector: LoopDetector = {
    requests: [],
    blockedUntil: new Map(),
    consecutiveErrors: new Map()
  };

  private readonly MAX_REQUESTS_PER_SECOND = 50;
  private readonly MAX_REQUESTS_PER_MINUTE = 500;
  private readonly BLOCK_DURATION_MS = 5000;
  private readonly ERROR_THRESHOLD = 15;
  private readonly DISABLED = true;

  constructor() {
    if (!this.DISABLED) {
      this.setupInterceptor();
      this.startCleanupInterval();
    } else {
      console.log('🚫 Sistema de Prevenção de Loops DESABILITADO');
    }
  }

  private setupInterceptor(): void {
    if (typeof window === 'undefined' || this.DISABLED) return;

    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = this.getUrlString(input);
      const method = init?.method || 'GET';

      if (this.DISABLED) {
        return originalFetch(input, init);
      }

      if (this.isBlocked(url)) {
        const blockedUntil = this.detector.blockedUntil.get(url);
        const remainingTime = blockedUntil ? Math.ceil((blockedUntil - Date.now()) / 1000) : 0;
        
        console.warn(`🚫 Requisição bloqueada: ${url} (${remainingTime}s restantes)`);
        
        return new Response(
          JSON.stringify({
            success: false,
            message: `Requisição temporariamente bloqueada. Aguarde ${remainingTime} segundos.`,
            isBlocked: true,
            remainingTime
          }),
          {
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
              'Content-Type': 'application/json',
              'X-Blocked-Until': blockedUntil?.toString() || '',
              'Retry-After': remainingTime.toString()
            }
          }
        );
      }

      if (this.detectLoop(url, method)) {
        this.blockUrl(url);
        console.log(`🚨 Loop detectado e bloqueado: ${url}`);
        
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Loop de requisições detectado e bloqueado.',
            isLoop: true
          }),
          {
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
              'Content-Type': 'application/json',
              'X-Loop-Detected': 'true'
            }
          }
        );
      }

      this.recordRequest(url, method);

      try {
        const response = await originalFetch(input, init);
        
        if (response.status === 429) {
          this.handleRateLimitError(url);
        } else if (response.ok) {
          this.detector.consecutiveErrors.delete(url);
        }
        
        return response;
      } catch (error) {
        this.handleRequestError(url);
        throw error;
      }
    };

    console.log('✅ Sistema de Prevenção de Loops ativado');
  }

  private getUrlString(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    return input.url;
  }

  private isBlocked(url: string): boolean {
    if (this.shouldIgnoreUrl(url)) {
      return false;
    }

    const blockedUntil = this.detector.blockedUntil.get(url);
    if (!blockedUntil) return false;
    
    const now = Date.now();
    if (now >= blockedUntil) {
      this.detector.blockedUntil.delete(url);
      return false;
    }
    
    return true;
  }

  private shouldIgnoreUrl(url: string): boolean {
    const ignorePatterns = [
      '/api/cache/',
      '/api/users/by-role',
      '/api/roles',
      '/api/admin/',
      '/api/users/stats',
      '/api/institutions',
      '/api/users?',
      '/api/tv-shows',
      '/api/auth/validate',
      '/api/auth/me',
    ];

    return ignorePatterns.some(pattern => url.includes(pattern));
  }

  private detectLoop(url: string, method: string): boolean {
    if (this.DISABLED) {
      return false;
    }

    if (this.shouldIgnoreUrl(url)) {
      return false;
    }

    const now = Date.now();
    
    this.detector.requests = this.detector.requests.filter(
      req => now - req.timestamp < 60000
    );

    const sameUrlRequests = this.detector.requests.filter(req => req.url === url);
    
    const lastSecondRequests = sameUrlRequests.filter(
      req => now - req.timestamp < 1000
    );
    
    if (lastSecondRequests.length >= this.MAX_REQUESTS_PER_SECOND) {
      console.warn(`⚠️ Muitas requisições por segundo: ${lastSecondRequests.length} para ${url}`);
      return true;
    }

    if (sameUrlRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      console.warn(`⚠️ Muitas requisições por minuto: ${sameUrlRequests.length} para ${url}`);
      return true;
    }

    const consecutiveErrors = this.detector.consecutiveErrors.get(url) || 0;
    if (consecutiveErrors >= this.ERROR_THRESHOLD) {
      console.warn(`⚠️ Muitos erros consecutivos: ${consecutiveErrors} para ${url}`);
      return true;
    }

    if (url.includes('/api/auth/login')) {
      const loginRequests = this.detector.requests.filter(
        req => req.url.includes('/api/auth/login') && now - req.timestamp < 5000
      );
      
      if (loginRequests.length >= 5) {
        console.warn(`⚠️ Muitas tentativas de login: ${loginRequests.length} em 5 segundos`);
        return true;
      }
    }

    return false;
  }

  private recordRequest(url: string, method: string): void {
    this.detector.requests.push({
      url,
      method,
      timestamp: Date.now()
    });

    if (this.detector.requests.length > 200) {
      this.detector.requests = this.detector.requests.slice(-200);
    }
  }

  private blockUrl(url: string): void {
    const blockUntil = Date.now() + this.BLOCK_DURATION_MS;
    this.detector.blockedUntil.set(url, blockUntil);
    
    if (url.includes('/api/auth/login')) {
      this.clearAuthData();
    }
  }

  private handleRateLimitError(url: string): void {
    const errors = (this.detector.consecutiveErrors.get(url) || 0) + 1;
    this.detector.consecutiveErrors.set(url, errors);
    
    if (errors >= this.ERROR_THRESHOLD) {
      this.blockUrl(url);
      console.log(`🚫 URL bloqueada após ${errors} erros 429 consecutivos: ${url}`);
    }
  }

  private handleRequestError(url: string): void {
    const errors = (this.detector.consecutiveErrors.get(url) || 0) + 1;
    this.detector.consecutiveErrors.set(url, errors);
    
    if (errors >= this.ERROR_THRESHOLD) {
      this.blockUrl(url);
      console.log(`🚫 URL bloqueada após ${errors} erros consecutivos: ${url}`);
    }
  }

  private clearAuthData(): void {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authData');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('authData');
      
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      console.log('🧹 Dados de autenticação limpos devido ao loop detectado');
    } catch (error) {
      console.log('Erro ao limpar dados de autenticação:', error);
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      
      this.detector.requests = this.detector.requests.filter(
        req => req.timestamp > oneHourAgo
      );
      
      for (const [url, blockedUntil] of Array.from(this.detector.blockedUntil.entries())) {
        if (now >= blockedUntil) {
          this.detector.blockedUntil.delete(url);
        }
      }
      
      this.detector.consecutiveErrors.clear();
      
    }, 5 * 60 * 1000);
  }

  public forceReset(): void {
    this.detector.requests = [];
    this.detector.blockedUntil.clear();
    this.detector.consecutiveErrors.clear();
    
    console.log('🔄 Sistema de prevenção de loops resetado');
  }

  public clearBlocks(): void {
    this.detector.blockedUntil.clear();
    console.log('🔓 Bloqueios de URL removidos');
  }

  public getStats(): {
    totalRequests: number;
    blockedUrls: number;
    urlsWithErrors: number;
  } {
    return {
      totalRequests: this.detector.requests.length,
      blockedUrls: this.detector.blockedUntil.size,
      urlsWithErrors: this.detector.consecutiveErrors.size
    };
  }

  public setEnabled(enabled: boolean): void {
    (this as any).DISABLED = !enabled;
    if (enabled && typeof window !== 'undefined') {
      this.setupInterceptor();
      this.startCleanupInterval();
    }
  }
}

// Instância global
let loopPreventionInstance: LoopPreventionSystem | null = null;

/**
 * Inicializa o sistema de prevenção de loops
 */
export function initializeLoopPrevention(): LoopPreventionSystem {
  if (!loopPreventionInstance && typeof window !== 'undefined') {
    loopPreventionInstance = new LoopPreventionSystem();
  }
  return loopPreventionInstance!;
}

/**
 * Obtém instância do sistema
 */
export function getLoopPrevention(): LoopPreventionSystem | null {
  return loopPreventionInstance;
}

/**
 * Reset de emergência
 */
export function emergencyLoopReset(): void {
  if (loopPreventionInstance) {
    loopPreventionInstance.forceReset();
  }
  
  // Recarregar página após 2 segundos
  setTimeout(() => {
    window.location.href = '/auth/login?reset=true';
  }, 2000);
}

/**
 * Limpa apenas bloqueios sem afetar autenticação
 */
export function clearLoopBlocks(): void {
  if (loopPreventionInstance) {
    loopPreventionInstance.clearBlocks();
  }
}

// Auto-inicializar se estiver no navegador
if (typeof window !== 'undefined') {
  initializeLoopPrevention();
} 