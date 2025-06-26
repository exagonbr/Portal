/**
 * Integração com Handtalk para acessibilidade em Língua Brasileira de Sinais (LIBRAS)
 */
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
              // @ts-ignore - O HT global é adicionado pelo script carregado
              window.ht = new window.HT(config);
              this.initialized = true;
              console.log('✅ Handtalk: Inicializado com sucesso');
            } else {
              console.warn('⚠️ Handtalk: Classe HT não disponível, continuando sem acessibilidade LIBRAS');
            }
          } catch (error) {
            console.warn('⚠️ Handtalk: Erro ao inicializar, continuando sem acessibilidade LIBRAS:', error);
          }
        })
        .catch(error => {
          console.warn('⚠️ Handtalk: Erro ao carregar script, continuando sem acessibilidade LIBRAS:', error);
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
          console.log('📍 Handtalk: Usando script local');
          return resolve();
        }

        const script = document.createElement('script');
        script.src = 'https://plugin.handtalk.me/web/latest/handtalk.min.js';
        script.async = true;
        script.crossOrigin = 'anonymous'; // Adicionar crossOrigin
        
        const timeout = setTimeout(() => {
          console.warn('⚠️ Handtalk: Timeout ao carregar script, continuando sem acessibilidade LIBRAS');
          script.remove();
          resolve(); // Resolve mesmo com timeout para não quebrar a aplicação
        }, 10000); // 10 segundos de timeout

        script.onload = () => {
          clearTimeout(timeout);
          console.log('✅ Handtalk: Script carregado com sucesso');
          resolve();
        };
        
        script.onerror = (error) => {
          clearTimeout(timeout);
          console.warn('⚠️ Handtalk: Erro ao carregar script, continuando sem acessibilidade LIBRAS:', error);
          script.remove();
          resolve(); // Resolve mesmo com erro para não quebrar a aplicação
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