/**
 * PWA Loop Fixer - Sistema avançado de detecção e correção de loops
 * Focado especialmente em loops de autenticação
 */

interface PWALoopDetector {
  requestCount: number;
  lastReset: number;
  threshold: number;
  windowMs: number;
  loginAttempts: number;
  lastLoginAttempt: number;
  suspiciousPatterns: string[];
}

class PWALoopFixer {
  private detector: PWALoopDetector = {
    requestCount: 0,
    lastReset: Date.now(),
    threshold: 20, // Reduzido para ser mais sensível
    windowMs: 30000, // 30 segundos
    loginAttempts: 0,
    lastLoginAttempt: 0,
    suspiciousPatterns: []
  };

  private isMonitoring = false;
  private originalFetch: typeof fetch | null = null;
  private loginLoopDetected = false;

  constructor() {
    console.log('🔧 PWA Loop Fixer inicializado');
  }

  /**
   * Inicia monitoramento de loops
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('🔍 PWA Loop Fixer já está monitorando');
      return;
    }

    console.log('🔍 Iniciando monitoramento de loops PWA...');
    this.isMonitoring = true;
    this.interceptFetch();
    this.monitorServiceWorker();
    this.setupPeriodicCleanup();
  }

  /**
   * Para monitoramento
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('🛑 Parando monitoramento de loops PWA...');
    this.isMonitoring = false;

    // Restaurar fetch original
    if (this.originalFetch && typeof window !== 'undefined') {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
  }

  /**
   * Intercepta requisições fetch para detectar loops
   */
  private interceptFetch(): void {
    if (typeof window === 'undefined') return;

    this.originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      // Verificar se é requisição de login
      if (url.includes('/api/auth/login')) {
        this.trackLoginRequest(url);
      }
      
      // Verificar se é requisição de API
      if (url.includes('/api/')) {
        this.trackRequest(url);
      }

      try {
        const response = await this.originalFetch!(input, init);
        
        // Verificar se recebemos erro 429 (Too Many Requests)
        if (response.status === 429 && url.includes('/api/auth/login')) {
          console.warn('🚨 Erro 429 detectado em login - possível loop!');
          this.handleLoginLoop(url, response);
        }
        
        return response;
      } catch (error) {
        console.error('❌ Erro na requisição interceptada:', error);
        throw error;
      }
    };
  }

  /**
   * Rastreia especificamente requisições de login
   */
  private trackLoginRequest(url: string): void {
    const now = Date.now();
    
    // Reset contador de login se passou muito tempo
    if (now - this.detector.lastLoginAttempt > 60000) { // 1 minuto
      this.detector.loginAttempts = 0;
    }
    
    this.detector.loginAttempts++;
    this.detector.lastLoginAttempt = now;
    
    console.log(`🔐 Login attempt #${this.detector.loginAttempts} tracked`);
    
    // Se muitas tentativas de login em pouco tempo
    if (this.detector.loginAttempts > 5) {
      console.error('🚨 Loop de Login Detectado!', {
        attempts: this.detector.loginAttempts,
        timeWindow: '1 minuto',
        url
      });
      
      this.handleLoginLoop(url);
    }
  }

  /**
   * Rastreia requisições para detectar loops gerais
   */
  private trackRequest(url: string): void {
    const now = Date.now();

    // Reset contador se passou da janela de tempo
    if (now - this.detector.lastReset > this.detector.windowMs) {
      this.detector.requestCount = 0;
      this.detector.lastReset = now;
      this.detector.suspiciousPatterns = [];
    }

    this.detector.requestCount++;
    
    // Adicionar padrão suspeito
    const pattern = this.extractUrlPattern(url);
    this.detector.suspiciousPatterns.push(pattern);
    
    // Manter apenas os últimos 10 padrões
    if (this.detector.suspiciousPatterns.length > 10) {
      this.detector.suspiciousPatterns = this.detector.suspiciousPatterns.slice(-10);
    }

    // Verificar se excedeu o threshold
    if (this.detector.requestCount > this.detector.threshold) {
      console.error('🚨 PWA Loop Detectado!', {
        url,
        count: this.detector.requestCount,
        timeWindow: this.detector.windowMs,
        threshold: this.detector.threshold,
        patterns: this.detector.suspiciousPatterns
      });

      this.handleLoopDetected(url);
    }
  }

  /**
   * Extrai padrão da URL para análise
   */
  private extractUrlPattern(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }

  /**
   * Lida especificamente com loops de login
   */
  private async handleLoginLoop(url: string, response?: Response): Promise<void> {
    if (this.loginLoopDetected) {
      console.log('🔧 Correção de loop de login já em andamento...');
      return;
    }
    
    this.loginLoopDetected = true;
    console.warn('🔧 PWA Loop Fixer: Aplicando correções para loop de login...');

    try {
      // 1. Limpar dados de autenticação
      this.clearAuthData();

      // 2. Limpar cache relacionado à autenticação
      await this.clearAuthCache();

      // 3. Verificar se há dados de resposta 429
      if (response) {
        try {
          const data = await response.clone().json();
          if (data.isLoop) {
            console.log('🚨 Loop confirmado pelo servidor, aplicando correção completa...');
            await this.emergencyAuthFix();
          }
        } catch (e) {
          console.warn('⚠️ Não foi possível ler dados da resposta 429');
        }
      }

      // 4. Mostrar notificação ao usuário
      this.showLoginLoopNotification();

      // 5. Aguardar e recarregar página
      setTimeout(() => {
        console.log('🔄 PWA Loop Fixer: Recarregando página após correção de login...');
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('❌ Erro durante correção de loop de login:', error);
      // Fallback: recarregar imediatamente
      window.location.reload();
    }
  }

  /**
   * Limpa dados de autenticação
   */
  private clearAuthData(): void {
    try {
      const authKeys = [
        'auth_token',
        'token',
        'user',
        'user_data',
        'refresh_token',
        'session_id',
        'auth_expires_at',
        'last_api_refresh_attempt'
      ];

      authKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Limpar cookies de autenticação
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

      console.log('✅ PWA Loop Fixer: Dados de autenticação limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados de autenticação:', error);
    }
  }

  /**
   * Limpa cache relacionado à autenticação
   */
  private async clearAuthCache(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const authCaches = cacheNames.filter(name => 
          name.includes('auth') || 
          name.includes('login') || 
          name.includes('api')
        );
        
        await Promise.all(
          authCaches.map(cacheName => caches.delete(cacheName))
        );
        
        console.log('✅ PWA Loop Fixer: Cache de autenticação limpo');
      }
    } catch (error) {
      console.error('❌ Erro ao limpar cache de autenticação:', error);
    }
  }

  /**
   * Correção de emergência para autenticação
   */
  private async emergencyAuthFix(): Promise<void> {
    try {
      // Limpar tudo relacionado ao service worker
      await this.clearServiceWorkerCache();
      await this.temporarilyDisableServiceWorker();
      
      // Limpar IndexedDB se existir
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name && (db.name.includes('auth') || db.name.includes('workbox'))) {
              indexedDB.deleteDatabase(db.name);
            }
          }
        } catch (e) {
          console.warn('⚠️ Não foi possível limpar IndexedDB');
        }
      }
      
      console.log('✅ PWA Loop Fixer: Correção de emergência aplicada');
    } catch (error) {
      console.error('❌ Erro na correção de emergência:', error);
    }
  }

  /**
   * Mostra notificação sobre loop de login
   */
  private showLoginLoopNotification(): void {
    try {
      // Remover notificações existentes
      const existingNotifications = document.querySelectorAll('.pwa-login-loop-notification');
      existingNotifications.forEach(el => el.remove());

      const notification = document.createElement('div');
      notification.className = 'pwa-login-loop-notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        background: #ef4444;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        max-width: 400px;
        text-align: center;
      `;
      
      notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; justify-content: center;">
          <div style="width: 16px; height: 16px; border: 2px solid white; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <span><strong>Loop de Login Detectado</strong></span>
        </div>
        <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">
          Corrigindo automaticamente... A página será recarregada.
        </div>
      `;

      // Adicionar animação de spin
      const style = document.createElement('style');
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      
      // Remover após 5 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
        if (style.parentNode) {
          style.remove();
        }
      }, 5000);
      
    } catch (error) {
      console.error('❌ Erro ao mostrar notificação:', error);
    }
  }

  /**
   * Configurar limpeza periódica
   */
  private setupPeriodicCleanup(): void {
    // Limpar contadores a cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      
      // Reset se não houve atividade recente
      if (now - this.detector.lastReset > 300000) { // 5 minutos
        this.detector.requestCount = 0;
        this.detector.loginAttempts = 0;
        this.detector.suspiciousPatterns = [];
        this.detector.lastReset = now;
        this.loginLoopDetected = false;
        
        console.log('🧹 PWA Loop Fixer: Limpeza periódica executada');
      }
    }, 300000); // 5 minutos
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

    // Monitorar mudanças de estado do service worker
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.addEventListener('statechange', (event) => {
          const sw = event.target as ServiceWorker;
          console.log(`🔄 PWA Loop Fixer: Service worker mudou para estado: ${sw.state}`);
          
          if (sw.state === 'redundant') {
            console.warn('⚠️ PWA Loop Fixer: Service worker tornou-se redundante');
            this.handleServiceWorkerRedundant();
          }
        });
      }
    }).catch(error => {
      console.error('❌ PWA Loop Fixer: Erro ao monitorar service worker:', error);
    });
  }

  /**
   * Lida com service worker redundante
   */
  private handleServiceWorkerRedundant(): void {
    console.log('🔧 PWA Loop Fixer: Tratando service worker redundante...');
    
    // Verificar se há um controller ativo
    if (navigator.serviceWorker.controller) {
      console.log('✅ PWA Loop Fixer: Novo service worker ativo detectado');
    } else {
      console.warn('⚠️ PWA Loop Fixer: Nenhum service worker ativo, pode ser necessário re-registrar');
      
      // Incrementar contador de problemas
      this.detector.requestCount += 5; // Penalizar por service worker redundante
    }
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

/**
 * Diagnostica o estado atual do Service Worker
 */
export async function diagnosePWAState(): Promise<{
  hasServiceWorker: boolean;
  isControlled: boolean;
  registrations: number;
  activeState?: string;
  cacheNames: string[];
  recommendation: string;
}> {
  const diagnosis = {
    hasServiceWorker: 'serviceWorker' in navigator,
    isControlled: !!navigator.serviceWorker?.controller,
    registrations: 0,
    activeState: undefined as string | undefined,
    cacheNames: [] as string[],
    recommendation: 'Tudo funcionando normalmente'
  };

  try {
    if (diagnosis.hasServiceWorker) {
      // Verificar registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      diagnosis.registrations = registrations.length;

      // Verificar estado do service worker ativo
      if (navigator.serviceWorker.controller) {
        diagnosis.activeState = navigator.serviceWorker.controller.state;
      }

      // Verificar caches
      if ('caches' in window) {
        diagnosis.cacheNames = await caches.keys();
      }

      // Gerar recomendação
      if (diagnosis.registrations === 0) {
        diagnosis.recommendation = 'Nenhum Service Worker registrado - considere registrar novamente';
      } else if (!diagnosis.isControlled) {
        diagnosis.recommendation = 'Service Worker registrado mas não está controlando a página';
      } else if (diagnosis.activeState === 'redundant') {
        diagnosis.recommendation = 'Service Worker redundante - uma atualização pode estar disponível';
      }
    } else {
      diagnosis.recommendation = 'Service Workers não são suportados neste navegador';
    }
  } catch (error) {
    console.error('❌ Erro ao diagnosticar PWA:', error);
    diagnosis.recommendation = 'Erro ao diagnosticar - considere recarregar a página';
  }

  return diagnosis;
}

/**
 * Expõe comandos de diagnóstico PWA no console (apenas em desenvolvimento)
 */
export function exposePWADiagnostics(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;

  // Expor funções no objeto window para acesso via console
  (window as any).PWADiagnostics = {
    diagnose: diagnosePWAState,
    emergencyFix: emergencyPWAFix,
    getStats: getPWALoopStats,
    isLoopActive: isPWALoopActive,
    
    // Função helper para mostrar diagnóstico formatado
    async showDiagnosis() {
      const diagnosis = await diagnosePWAState();
      console.group('🔍 PWA Diagnosis');
      console.log('Service Worker Support:', diagnosis.hasServiceWorker ? '✅' : '❌');
      console.log('Page Controlled:', diagnosis.isControlled ? '✅' : '❌');
      console.log('Registrations:', diagnosis.registrations);
      console.log('Active State:', diagnosis.activeState || 'N/A');
      console.log('Cache Names:', diagnosis.cacheNames);
      console.log('Recommendation:', diagnosis.recommendation);
      console.groupEnd();
      return diagnosis;
    },

    // Função para limpar apenas caches
    async clearCaches() {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ Todos os caches foram limpos');
      }
    }
  };

  console.log('🔧 PWA Diagnostics disponível! Use PWADiagnostics.showDiagnosis() no console');
} 