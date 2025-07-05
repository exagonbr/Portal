/**
 * Utilitário para monitorar redirecionamentos e identificar problemas
 */

interface RedirectEvent {
  timestamp: number;
  from: string;
  to: string;
  method: 'router.push' | 'router.replace' | 'window.location' | 'redirect';
  context?: string;
}

class RedirectMonitor {
  private events: RedirectEvent[] = [];
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Registra um evento de redirecionamento
   */
  logRedirect(to: string, method: RedirectEvent['method'], context?: string) {
    if (!this.isEnabled) return;

    const event: RedirectEvent = {
      timestamp: Date.now(),
      from: typeof window !== 'undefined' ? window.location.href : 'server',
      to,
      method,
      context
    };

    this.events.push(event);
    
    // Manter apenas os últimos 50 eventos
    if (this.events.length > 50) {
      this.events = this.events.slice(-50);
    }

    console.log(`🔄 [REDIRECT] ${method} para ${to}`, {
      from: event.from,
      context: context || 'N/A',
      timestamp: new Date(event.timestamp).toISOString()
    });

    // Detectar possíveis loops
    this.detectLoops();
  }

  /**
   * Detecta loops de redirecionamento
   */
  private detectLoops() {
    if (this.events.length < 3) return;

    const recent = this.events.slice(-5);
    const now = Date.now();
    
    // Verificar se há redirecionamentos muito frequentes
    const rapidRedirects = recent.filter(event => 
      now - event.timestamp < 5000 // Últimos 5 segundos
    );

    if (rapidRedirects.length >= 3) {
      console.warn('🚨 [REDIRECT MONITOR] Possível loop detectado!', {
        count: rapidRedirects.length,
        events: rapidRedirects.map(e => ({
          time: new Date(e.timestamp).toISOString(),
          from: e.from,
          to: e.to,
          method: e.method,
          context: e.context
        }))
      });
    }

    // Verificar redirecionamentos circulares
    const paths = recent.map(e => e.to);
    const uniquePaths = new Set(paths);
    
    if (paths.length > 2 && uniquePaths.size < paths.length) {
      console.warn('🔄 [REDIRECT MONITOR] Redirecionamento circular detectado!', {
        paths,
        uniquePaths: Array.from(uniquePaths)
      });
    }
  }

  /**
   * Obtém o histórico de redirecionamentos
   */
  getHistory(): RedirectEvent[] {
    return [...this.events];
  }

  /**
   * Limpa o histórico
   */
  clearHistory() {
    this.events = [];
    console.log('🧹 [REDIRECT MONITOR] Histórico limpo');
  }

  /**
   * Gera um relatório de redirecionamentos
   */
  generateReport() {
    if (!this.isEnabled) {
      console.log('📊 [REDIRECT MONITOR] Desabilitado em produção');
      return;
    }

    console.group('📊 [REDIRECT MONITOR] Relatório de Redirecionamentos');
    
    console.log(`Total de eventos: ${this.events.length}`);
    
    if (this.events.length === 0) {
      console.log('Nenhum redirecionamento registrado');
      console.groupEnd();
      return;
    }

    // Agrupar por método
    const byMethod = this.events.reduce((acc, event) => {
      acc[event.method] = (acc[event.method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Redirecionamentos por método:', byMethod);

    // Agrupar por contexto
    const byContext = this.events.reduce((acc, event) => {
      const context = event.context || 'unknown';
      acc[context] = (acc[context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Redirecionamentos por contexto:', byContext);

    // Mostrar últimos 10 eventos
    console.log('Últimos 10 eventos:');
    this.events.slice(-10).forEach((event, index) => {
      console.log(`${index + 1}. ${new Date(event.timestamp).toISOString()} - ${event.method} para ${event.to} (${event.context || 'N/A'})`);
    });

    console.groupEnd();
  }

  /**
   * Monitora um router do Next.js
   */
  monitorRouter(router: any) {
    if (!this.isEnabled || !router) return;

    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (...args: any[]) => {
      const path = args[0];
      this.logRedirect(path, 'router.push', 'NextJS Router');
      return originalPush.apply(router, args);
    };

    router.replace = (...args: any[]) => {
      const path = args[0];
      this.logRedirect(path, 'router.replace', 'NextJS Router');
      return originalReplace.apply(router, args);
    };

    console.log('🔍 [REDIRECT MONITOR] Router monitorado');
  }

  /**
   * Monitora window.location
   */
  monitorWindowLocation() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    const originalAssign = window.location.assign;
    const originalReplace = window.location.replace;

    window.location.assign = (url: string) => {
      this.logRedirect(url, 'window.location', 'Window Location Assign');
      return originalAssign.call(window.location, url);
    };

    window.location.replace = (url: string) => {
      this.logRedirect(url, 'window.location', 'Window Location Replace');
      return originalReplace.call(window.location, url);
    };

    // Monitorar mudanças no href
    let lastHref = window.location.href;
    const checkHref = () => {
      if (window.location.href !== lastHref) {
        this.logRedirect(window.location.href, 'window.location', 'Window Location Href');
        lastHref = window.location.href;
      }
    };

    setInterval(checkHref, 1000);

    console.log('🔍 [REDIRECT MONITOR] Window location monitorado');
  }
}

// Instância singleton
export const redirectMonitor = new RedirectMonitor();

// Tornar disponível globalmente em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).redirectMonitor = redirectMonitor;
}

/**
 * Hook para monitorar redirecionamentos em componentes React
 */
export const useRedirectMonitor = () => {
  return {
    logRedirect: redirectMonitor.logRedirect.bind(redirectMonitor),
    getHistory: redirectMonitor.getHistory.bind(redirectMonitor),
    clearHistory: redirectMonitor.clearHistory.bind(redirectMonitor),
    generateReport: redirectMonitor.generateReport.bind(redirectMonitor)
  };
};

/**
 * Wrapper para router.push com monitoramento
 */
export const monitoredPush = (router: any, path: string, context?: string) => {
  redirectMonitor.logRedirect(path, 'router.push', context);
  return router.push(path);
};

/**
 * Wrapper para router.replace com monitoramento
 */
export const monitoredReplace = (router: any, path: string, context?: string) => {
  redirectMonitor.logRedirect(path, 'router.replace', context);
  return router.replace(path);
}; 