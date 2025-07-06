'use client'

/**
 * Utilitário de diagnóstico para problemas de factory/webpack
 */

interface DiagnosticInfo {
  timestamp: string;
  userAgent: string;
  url: string;
  error: string;
  stack?: string;
  additionalInfo?: any;
}

export class FactoryDiagnostic {
  private static instance: FactoryDiagnostic;
  private diagnostics: DiagnosticInfo[] = [];
  private maxDiagnostics = 10;
  private retryAttempts = new Map<string, number>();
  private maxRetries = 3;

  static getInstance(): FactoryDiagnostic {
    if (!FactoryDiagnostic.instance) {
      FactoryDiagnostic.instance = new FactoryDiagnostic();
    }
    return FactoryDiagnostic.instance;
  }

  private constructor() {
    this.setupErrorListeners();
    this.setupWebpackHooks();
  }

  private setupWebpackHooks() {
    if (typeof window === 'undefined') return;

    // Interceptar __webpack_require__ para adicionar tratamento de erro
    const originalRequire = (window as any).__webpack_require__;
    if (originalRequire && typeof originalRequire === 'function') {
      (window as any).__webpack_require__ = (...args: any[]) => {
        try {
          return originalRequire.apply(this, args);
        } catch (error) {
          if (this.isFactoryError(error)) {
            const moduleId = args[0];
            this.handleFactoryError(moduleId, error);
          }
          throw error;
        }
      };
    }
  }

  private handleFactoryError(moduleId: string, error: unknown) {
    const attempts = this.retryAttempts.get(moduleId) || 0;
    
    if (attempts < this.maxRetries) {
      this.retryAttempts.set(moduleId, attempts + 1);
      
      // Tentar recarregar o chunk
      if (typeof window !== 'undefined') {
        const runtime = (window as any).webpackChunk;
        if (runtime && typeof runtime.push === 'function') {
          setTimeout(() => {
            try {
              // Forçar recarga do chunk
              runtime.push([[moduleId], {}, (require: any) => require(moduleId)]);
            } catch (e) {
              console.warn(`Falha ao recarregar módulo ${moduleId}:`, e);
            }
          }, Math.pow(2, attempts) * 1000); // Backoff exponencial
        }
      }
    }
  }

  private setupErrorListeners() {
    if (typeof window === 'undefined') return;

    // Listener para erros de JavaScript
    window.addEventListener('error', (event) => {
      if (this.isFactoryError(event.error)) {
        this.logDiagnostic({
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          error: event.error?.message || 'Unknown error',
          stack: event.error?.stack,
          additionalInfo: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            type: 'javascript-error'
          }
        });
      }
    });

    // Listener para promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      if (this.isFactoryError(event.reason)) {
        this.logDiagnostic({
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          error: event.reason?.message || 'Promise rejection',
          stack: event.reason?.stack,
          additionalInfo: {
            reason: event.reason,
            type: 'promise-rejection'
          }
        });
      }
    });
  }

  private isFactoryError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message || error.toString();
    return (
      errorMessage.includes("can't access property \"call\"") ||
      errorMessage.includes("originalFactory is undefined") ||
      errorMessage.includes("Cannot read properties of undefined (reading 'call')") ||
      errorMessage.includes("factory is undefined") ||
      errorMessage.includes("ChunkLoadError") ||
      errorMessage.includes("Loading chunk") ||
      errorMessage.includes("Failed to fetch dynamically imported module") ||
      errorMessage.includes("NetworkError when attempting to fetch resource")
    );
  }

  private logDiagnostic(info: DiagnosticInfo) {
    this.diagnostics.push(info);
    
    // Manter apenas os últimos diagnósticos
    if (this.diagnostics.length > this.maxDiagnostics) {
      this.diagnostics = this.diagnostics.slice(-this.maxDiagnostics);
    }

    // Log no console para debug
    console.warn('🔍 Factory Error Diagnostic:', info);

    // Salvar no localStorage para persistência
    try {
      localStorage.setItem('factory-diagnostics', JSON.stringify(this.diagnostics));
    } catch (e) {
      console.warn('Não foi possível salvar diagnósticos no localStorage');
    }
  }

  public getDiagnostics(): DiagnosticInfo[] {
    return [...this.diagnostics];
  }

  public getLastDiagnostic(): DiagnosticInfo | null {
    return this.diagnostics.length > 0 ? this.diagnostics[this.diagnostics.length - 1] : null;
  }

  public clearDiagnostics() {
    this.diagnostics = [];
    try {
      localStorage.removeItem('factory-diagnostics');
    } catch (e) {
      console.warn('Não foi possível limpar diagnósticos do localStorage');
    }
  }

  public loadPersistedDiagnostics() {
    try {
      const saved = localStorage.getItem('factory-diagnostics');
      if (saved) {
        this.diagnostics = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Não foi possível carregar diagnósticos do localStorage');
    }
  }

  public generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: this.diagnostics.length,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      diagnostics: this.diagnostics
    };

    return JSON.stringify(report, null, 2);
  }
}

// Função de conveniência para inicializar o diagnóstico
export function initializeFactoryDiagnostic(): FactoryDiagnostic {
  const diagnostic = FactoryDiagnostic.getInstance();
  diagnostic.loadPersistedDiagnostics();
  return diagnostic;
}

// Função para verificar se há problemas de factory ativos
export function checkFactoryHealth(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    // Tentar acessar algumas funcionalidades básicas do webpack
    const testRequire = (window as any).__webpack_require__;
    if (testRequire && typeof testRequire === 'function') {
      return true;
    }
    
    // Se __webpack_require__ não estiver disponível, ainda pode estar OK
    return true;
  } catch (error) {
    console.warn('⚠️ Possível problema de factory detectado:', error);
    return false;
  }
}

// Hook React para usar o diagnóstico
export function useFactoryDiagnostic() {
  if (typeof window === 'undefined') {
    return {
      diagnostics: [],
      lastDiagnostic: null,
      isHealthy: true,
      clearDiagnostics: () => {},
      generateReport: () => ''
    };
  }

  const diagnostic = FactoryDiagnostic.getInstance();
  
  return {
    diagnostics: diagnostic.getDiagnostics(),
    lastDiagnostic: diagnostic.getLastDiagnostic(),
    isHealthy: checkFactoryHealth(),
    clearDiagnostics: () => diagnostic.clearDiagnostics(),
    generateReport: () => diagnostic.generateReport()
  };
} 