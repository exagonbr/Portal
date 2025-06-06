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
          // @ts-ignore - O HT global é adicionado pelo script carregado
          window.ht = new window.HT(config);
          this.initialized = true;
        })
        .catch(error => {
          console.error('Erro ao carregar Handtalk:', error);
        });
    }
  }

  /**
   * Carrega o script do Handtalk dinamicamente
   */
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window !== 'undefined') {
        // Verifica se o script já foi carregado
        if (document.querySelector('script[src*="handtalk.min.js"]')) {
          return resolve();
        }

        const script = document.createElement('script');
        script.src = 'https://plugin.handtalk.me/web/latest/handtalk.min.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Falha ao carregar o script do Handtalk'));
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