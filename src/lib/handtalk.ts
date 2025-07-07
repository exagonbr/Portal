/**
 * Integração com Handtalk para acessibilidade em Língua Brasileira de Sinais (LIBRAS)
 */
declare global {
  interface Window {
    HT?: any;
    ht?: any;
  }
}

export class HT {
  private static instance: HT | null = null;
  private initialized: boolean = false;

  constructor(config: { token: string }) {
    if (typeof window !== 'undefined') {
      this.loadScript()
        .then(() => {
          try {
            // Verificar se o HT está disponível globalmente
            if (typeof window.HT === 'function') {
              // Inicializar o plugin Handtalk
              window.ht = new window.HT(config);
              this.initialized = true;
            } else {
              // Tentar carregar novamente após um curto atraso
              setTimeout(() => {
                if (typeof window.HT === 'function') {
                  window.ht = new window.HT(config);
                  this.initialized = true;
                }
              }, 2000);
            }
          } catch (error) {
            // Continua sem acessibilidade LIBRAS
          }
        })
        .catch(error => {
          // Continua sem acessibilidade LIBRAS
        });
    }
  }

  /**
   * Carrega o script do Handtalk dinamicamente com tratamento de erros robusto
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined') {
        // Verifica se o script já foi carregado
        if (document.querySelector('script[src*="handtalk.min.js"]') || window.HT) {
          return resolve();
        }

        // Tentar carregar primeiro do local (se disponível)
        const localScript = document.querySelector('script[src*="/handtalk/handtalk.min.js"]');
        if (localScript) {
          return resolve();
        }

        const script = document.createElement('script');
        script.src = 'https://plugin.handtalk.me/web/latest/handtalk.min.js';
        script.async = true;
        script.crossOrigin = 'anonymous'; // Adicionar crossOrigin
        
        const timeout = setTimeout(() => {
          script.remove();
          resolve(); // Resolve mesmo com timeout para não quebrar a aplicação
        }, 10000); // 10 segundos de timeout

        script.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        script.onerror = (error) => {
          clearTimeout(timeout);
          script.remove();
          
          // Tentar carregar de CDN alternativa
          const fallbackScript = document.createElement('script');
          fallbackScript.src = 'https://api.handtalk.me/plugin/latest/handtalk.min.js';
          fallbackScript.async = true;
          
          fallbackScript.onload = () => {
            resolve();
          };
          
          fallbackScript.onerror = () => {
            resolve(); // Resolve mesmo com erro para não quebrar a aplicação
          };
          
          document.head.appendChild(fallbackScript);
        };
        
        document.head.appendChild(script);
      } else {
        reject(new Error('Window não está disponível'));
      }
    });
  }

  /**
   * Retorna a instância única do Handtalk (padrão Singleton)
   */
  public static getInstance(config: { token: string }): HT {
    if (!HT.instance) {
      HT.instance = new HT(config);
    }
    return HT.instance;
  }

  /**
   * Verifica se a integração foi inicializada com sucesso
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
} 