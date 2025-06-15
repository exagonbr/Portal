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

  private readonly MAX_REQUESTS_PER_SECOND = 2;
  private readonly MAX_REQUESTS_PER_MINUTE = 10;
  private readonly BLOCK_DURATION_MS = 30000; // 30 segundos
  private readonly ERROR_THRESHOLD = 3;

  constructor() {
    this.setupInterceptor();
    this.startCleanupInterval();
  }

  /**
   * Configura interceptador global de fetch
   */
  private setupInterceptor(): void {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = this.getUrlString(input);
      const method = init?.method || 'GET';
      
      // Verificar se a URL está bloqueada
      if (this.isBlocked(url)) {
        console.error(`🚫 Requisição bloqueada por prevenção de loop: ${url}`);
        
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Requisição bloqueada temporariamente para prevenir loop. Aguarde 30 segundos.',
            isLoop: true,
            blockedUntil: this.detector.blockedUntil.get(url)
          }),
          {
            status: 429,
            statusText: 'Too Many Requests',
            headers: {
              'Content-Type': 'application/json',
              'X-Loop-Prevention': 'true'
            }
          }
        );
      }

      // Verificar se há loop em andamento
      if (this.detectLoop(url, method)) {
        this.blockUrl(url);
        console.error(`🚨 Loop detectado e bloqueado: ${url}`);
        
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

      // Registrar requisição
      this.recordRequest(url, method);

      try {
        const response = await originalFetch(input, init);
        
        // Verificar resposta para detectar loops
        if (response.status === 429) {
          this.handleRateLimitError(url);
        } else if (response.ok) {
          // Limpar contador de erros consecutivos em caso de sucesso
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

  /**
   * Obtém URL como string
   */
  private getUrlString(input: RequestInfo | URL): string {
    if (typeof input === 'string') return input;
    if (input instanceof URL) return input.toString();
    return input.url;
  }

  /**
   * Verifica se URL está bloqueada
   */
  private isBlocked(url: string): boolean {
    const blockedUntil = this.detector.blockedUntil.get(url);
    if (!blockedUntil) return false;
    
    const now = Date.now();
    if (now >= blockedUntil) {
      this.detector.blockedUntil.delete(url);
      return false;
    }
    
    return true;
  }

  /**
   * Detecta padrões de loop
   */
  private detectLoop(url: string, method: string): boolean {
    const now = Date.now();
    
    // Limpar requisições antigas (mais de 1 minuto)
    this.detector.requests = this.detector.requests.filter(
      req => now - req.timestamp < 60000
    );

    // Filtrar requisições para a mesma URL
    const sameUrlRequests = this.detector.requests.filter(req => req.url === url);
    
    // Verificar requisições no último segundo
    const lastSecondRequests = sameUrlRequests.filter(
      req => now - req.timestamp < 1000
    );
    
    if (lastSecondRequests.length >= this.MAX_REQUESTS_PER_SECOND) {
      console.warn(`⚠️ Muitas requisições por segundo: ${lastSecondRequests.length} para ${url}`);
      return true;
    }

    // Verificar requisições no último minuto
    if (sameUrlRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
      console.warn(`⚠️ Muitas requisições por minuto: ${sameUrlRequests.length} para ${url}`);
      return true;
    }

    // Verificar erros consecutivos
    const consecutiveErrors = this.detector.consecutiveErrors.get(url) || 0;
    if (consecutiveErrors >= this.ERROR_THRESHOLD) {
      console.warn(`⚠️ Muitos erros consecutivos: ${consecutiveErrors} para ${url}`);
      return true;
    }

    // Verificar padrão específico de login
    if (url.includes('/api/auth/login')) {
      const loginRequests = this.detector.requests.filter(
        req => req.url.includes('/api/auth/login') && now - req.timestamp < 5000
      );
      
      if (loginRequests.length >= 3) {
        console.warn(`⚠️ Muitas tentativas de login: ${loginRequests.length} em 5 segundos`);
        return true;
      }
    }

    return false;
  }

  /**
   * Registra uma requisição
   */
  private recordRequest(url: string, method: string): void {
    this.detector.requests.push({
      url,
      method,
      timestamp: Date.now()
    });

    // Manter apenas as últimas 100 requisições
    if (this.detector.requests.length > 100) {
      this.detector.requests = this.detector.requests.slice(-100);
    }
  }

  /**
   * Bloqueia uma URL
   */
  private blockUrl(url: string): void {
    const blockUntil = Date.now() + this.BLOCK_DURATION_MS;
    this.detector.blockedUntil.set(url, blockUntil);
    
    // Limpar dados de autenticação se for login
    if (url.includes('/api/auth/login')) {
      this.clearAuthData();
    }
  }

  /**
   * Trata erro de rate limit
   */
  private handleRateLimitError(url: string): void {
    const errors = (this.detector.consecutiveErrors.get(url) || 0) + 1;
    this.detector.consecutiveErrors.set(url, errors);
    
    if (errors >= this.ERROR_THRESHOLD) {
      this.blockUrl(url);
      console.error(`🚫 URL bloqueada após ${errors} erros 429 consecutivos: ${url}`);
    }
  }

  /**
   * Trata erro de requisição
   */
  private handleRequestError(url: string): void {
    const errors = (this.detector.consecutiveErrors.get(url) || 0) + 1;
    this.detector.consecutiveErrors.set(url, errors);
  }

  /**
   * Limpa dados de autenticação
   */
  private clearAuthData(): void {
    try {
      // Limpar localStorage
      const authKeys = [
        'auth_token',
        'refresh_token',
        'user_data',
        'session_id',
        'last_login_attempt',
        'login_attempt_count'
      ];
      
      authKeys.forEach(key => localStorage.removeItem(key));
      
      // Limpar sessionStorage
      sessionStorage.clear();
      
      // Limpar cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
      
      console.log('🧹 Dados de autenticação limpos para prevenir loop');
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  }

  /**
   * Inicia intervalo de limpeza
   */
  private startCleanupInterval(): void {
    // Limpar dados antigos a cada minuto
    setInterval(() => {
      const now = Date.now();
      
      // Limpar URLs bloqueadas expiradas
      for (const [url, blockedUntil] of this.detector.blockedUntil.entries()) {
        if (now >= blockedUntil) {
          this.detector.blockedUntil.delete(url);
        }
      }
      
      // Limpar requisições antigas
      this.detector.requests = this.detector.requests.filter(
        req => now - req.timestamp < 300000 // 5 minutos
      );
      
      // Limpar contadores de erro antigos
      if (this.detector.consecutiveErrors.size > 50) {
        this.detector.consecutiveErrors.clear();
      }
    }, 60000); // A cada minuto
  }

  /**
   * Força reset do sistema (para emergências)
   */
  public forceReset(): void {
    this.detector.requests = [];
    this.detector.blockedUntil.clear();
    this.detector.consecutiveErrors.clear();
    this.clearAuthData();
    console.log('🔄 Sistema de prevenção de loops resetado');
  }

  /**
   * Obtém estatísticas do sistema
   */
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
    window.location.href = '/login?reset=true';
  }, 2000);
}

// Auto-inicializar se estiver no navegador
if (typeof window !== 'undefined') {
  initializeLoopPrevention();
} 