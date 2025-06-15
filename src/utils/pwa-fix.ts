/**
 * Utilitário para corrigir loops causados pelo PWA
 * Identifica e resolve problemas de interceptação de requisições
 */

interface PWALoopDetector {
  requestCount: number;
  lastReset: number;
  threshold: number;
  windowMs: number;
}

class PWALoopFixer {
  private detector: PWALoopDetector = {
    requestCount: 0,
    lastReset: Date.now(),
    threshold: 10, // máximo 10 requisições por janela
    windowMs: 5000, // janela de 5 segundos
  };

  private originalFetch: typeof fetch;
  private isMonitoring = false;

  constructor() {
    this.originalFetch = window.fetch;
  }

  /**
   * Inicia o monitoramento de loops
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    console.log('🔍 PWA Loop Fixer: Iniciando monitoramento');
    this.isMonitoring = true;

    // Interceptar fetch para detectar loops
    window.fetch = this.createFetchInterceptor();

    // Monitorar service worker
    this.monitorServiceWorker();
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('🛑 PWA Loop Fixer: Parando monitoramento');
    this.isMonitoring = false;

    // Restaurar fetch original
    window.fetch = this.originalFetch;
  }

  /**
   * Cria interceptor de fetch para detectar loops
   */
  private createFetchInterceptor() {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      // Verificar se é requisição de API
      if (url.includes('/api/')) {
        this.trackRequest(url);
      }

      // Chamar fetch original
      return this.originalFetch(input, init);
    };
  }

  /**
   * Rastreia requisições para detectar loops
   */
  private trackRequest(url: string): void {
    const now = Date.now();

    // Reset contador se passou da janela de tempo
    if (now - this.detector.lastReset > this.detector.windowMs) {
      this.detector.requestCount = 0;
      this.detector.lastReset = now;
    }

    this.detector.requestCount++;

    // Verificar se excedeu o threshold
    if (this.detector.requestCount > this.detector.threshold) {
      console.error('🚨 PWA Loop Detectado!', {
        url,
        count: this.detector.requestCount,
        timeWindow: this.detector.windowMs,
        threshold: this.detector.threshold
      });

      this.handleLoopDetected(url);
    }
  }

  /**
   * Lida com loop detectado
   */
  private handleLoopDetected(url: string): void {
    console.warn('🔧 PWA Loop Fixer: Aplicando correções...');

    // 1. Limpar cache do service worker
    this.clearServiceWorkerCache();

    // 2. Desregistrar service worker temporariamente
    this.temporarilyDisableServiceWorker();

    // 3. Limpar localStorage relacionado ao PWA
    this.clearPWAStorage();

    // 4. Recarregar página após limpeza
    setTimeout(() => {
      console.log('🔄 PWA Loop Fixer: Recarregando página...');
      window.location.reload();
    }, 2000);
  }

  /**
   * Limpa cache do service worker
   */
  private async clearServiceWorkerCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ PWA Loop Fixer: Cache do service worker limpo');
      }
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
    }
  }

  /**
   * Desregistra service worker temporariamente
   */
  private async temporarilyDisableServiceWorker(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('✅ PWA Loop Fixer: Service worker desregistrado');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao desregistrar service worker:', error);
    }
  }

  /**
   * Limpa storage relacionado ao PWA
   */
  private clearPWAStorage(): void {
    try {
      // Limpar itens específicos do PWA
      const pwaKeys = [
        'pwa-install-prompt',
        'pwa-update-available',
        'workbox-precache',
        'workbox-runtime'
      ];

      pwaKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      console.log('✅ PWA Loop Fixer: Storage PWA limpo');
    } catch (error) {
      console.error('❌ Erro ao limpar storage PWA:', error);
    }
  }

  /**
   * Monitora service worker para detectar problemas
   */
  private monitorServiceWorker(): void {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 PWA Loop Fixer: Mensagem do service worker:', event.data);
      
      // Detectar mensagens suspeitas que podem indicar loop
      if (event.data && typeof event.data === 'object') {
        if (event.data.type === 'CACHE_UPDATED' || event.data.type === 'SKIP_WAITING') {
          console.log('🔍 PWA Loop Fixer: Atividade suspeita do service worker detectada');
        }
      }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 PWA Loop Fixer: Service worker controller mudou');
    });
  }

  /**
   * Verifica se há sinais de loop ativo
   */
  isLoopActive(): boolean {
    const now = Date.now();
    return (
      now - this.detector.lastReset < this.detector.windowMs &&
      this.detector.requestCount > this.detector.threshold
    );
  }

  /**
   * Obtém estatísticas do detector
   */
  getStats() {
    return {
      requestCount: this.detector.requestCount,
      timeWindow: this.detector.windowMs,
      threshold: this.detector.threshold,
      isActive: this.isLoopActive(),
      lastReset: new Date(this.detector.lastReset).toISOString()
    };
  }
}

// Instância global
let pwaLoopFixer: PWALoopFixer | null = null;

/**
 * Inicializa o PWA Loop Fixer
 */
export function initPWALoopFixer(): PWALoopFixer {
  if (typeof window === 'undefined') {
    throw new Error('PWA Loop Fixer só pode ser usado no browser');
  }

  if (!pwaLoopFixer) {
    pwaLoopFixer = new PWALoopFixer();
  }

  return pwaLoopFixer;
}

/**
 * Inicia monitoramento automático
 */
export function startPWALoopMonitoring(): void {
  const fixer = initPWALoopFixer();
  fixer.startMonitoring();
}

/**
 * Para monitoramento
 */
export function stopPWALoopMonitoring(): void {
  if (pwaLoopFixer) {
    pwaLoopFixer.stopMonitoring();
  }
}

/**
 * Verifica se há loop ativo
 */
export function isPWALoopActive(): boolean {
  return pwaLoopFixer?.isLoopActive() || false;
}

/**
 * Obtém estatísticas do loop detector
 */
export function getPWALoopStats() {
  return pwaLoopFixer?.getStats() || null;
}

/**
 * Correção de emergência - limpa tudo relacionado ao PWA
 */
export async function emergencyPWAFix(): Promise<void> {
  console.warn('🚨 PWA Emergency Fix: Executando correção de emergência...');

  try {
    // 1. Desregistrar todos os service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    // 2. Limpar todos os caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }

    // 3. Limpar storage
    localStorage.clear();
    sessionStorage.clear();

    // 4. Recarregar página
    window.location.reload();

  } catch (error) {
    console.error('❌ Erro na correção de emergência:', error);
    // Fallback: recarregar página mesmo com erro
    window.location.reload();
  }
} 