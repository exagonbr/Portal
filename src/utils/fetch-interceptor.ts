/**
 * Sistema coordenado de interceptação de fetch
 * Permite múltiplos interceptadores sem conflitos
 */

type FetchTransformer = (input: RequestInfo | URL, init?: RequestInit) => { input: RequestInfo | URL; init?: RequestInit };
type FetchMonitor = (input: RequestInfo | URL, init?: RequestInit) => void;

interface FetchInterceptorConfig {
  transformer?: FetchTransformer;
  monitor?: FetchMonitor;
}

class FetchInterceptorManager {
  private originalFetch: typeof fetch;
  private interceptors: Map<string, FetchInterceptorConfig> = new Map();
  private isActive = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.originalFetch = window.fetch.bind(window);
    }
  }

  /**
   * Adiciona um interceptador
   */
  addInterceptor(name: string, config: FetchInterceptorConfig): void {
    this.interceptors.set(name, config);
    this.updateFetchInterceptor();
  }

  /**
   * Remove um interceptador
   */
  removeInterceptor(name: string): void {
    this.interceptors.delete(name);
    this.updateFetchInterceptor();
  }

  /**
   * Atualiza o interceptador principal
   */
  private updateFetchInterceptor(): void {
    if (typeof window === 'undefined') return;

    if (this.interceptors.size > 0 && !this.isActive) {
      // Ativar interceptação
      window.fetch = this.createCombinedInterceptor();
      this.isActive = true;
      console.log('✅ Fetch Interceptor Manager: Ativado com', this.interceptors.size, 'interceptadores');
    } else if (this.interceptors.size === 0 && this.isActive) {
      // Desativar interceptação
      window.fetch = this.originalFetch;
      this.isActive = false;
      console.log('🛑 Fetch Interceptor Manager: Desativado');
    }
  }

  /**
   * Cria interceptador combinado
   */
  private createCombinedInterceptor() {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let currentInput = input;
      let currentInit = init;

      // Aplicar transformações
      for (const [name, config] of this.interceptors) {
        try {
          if (config.transformer) {
            const result = config.transformer(currentInput, currentInit);
            currentInput = result.input;
            currentInit = result.init;
          }
        } catch (error) {
          console.warn(`Transformer ${name} failed:`, error);
        }
      }

      // Executar monitores
      for (const [name, config] of this.interceptors) {
        try {
          if (config.monitor) {
            config.monitor(currentInput, currentInit);
          }
        } catch (error) {
          console.warn(`Monitor ${name} failed:`, error);
        }
      }

      // Executar fetch original
      return this.originalFetch(currentInput, currentInit);
    };
  }

  /**
   * Obtém estatísticas dos interceptadores
   */
  getStats() {
    return {
      activeInterceptors: Array.from(this.interceptors.keys()),
      isActive: this.isActive,
      count: this.interceptors.size
    };
  }
}

// Instância global
const fetchInterceptorManager = new FetchInterceptorManager();

export { fetchInterceptorManager, type FetchTransformer, type FetchMonitor, type FetchInterceptorConfig }; 