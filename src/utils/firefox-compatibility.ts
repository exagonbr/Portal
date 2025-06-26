/**
 * Utilitários para compatibilidade com Firefox
 * Resolve problemas específicos do Firefox, incluindo NS_BINDING_ABORTED
 */

// Detecta se o navegador é Firefox
export const isFirefox = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Firefox/i.test(navigator.userAgent);
};

// Detecta se é Firefox Mobile
export const isFirefoxMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Firefox/i.test(ua) && /Mobile|Android/i.test(ua);
};

// Configurações específicas para Firefox
export const FIREFOX_CONFIG = {
  // Timeouts mais longos para Firefox
  REQUEST_TIMEOUT: 45000, // 45 segundos
  RETRY_DELAY: 2000, // 2 segundos entre tentativas
  MAX_RETRIES: 5,
  
  // Headers específicos para Firefox
  HEADERS: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  
  // Configurações de fetch para Firefox
  FETCH_OPTIONS: {
    keepalive: false, // Desabilita keepalive que pode causar problemas
    cache: 'no-store' as RequestCache,
    redirect: 'follow' as RequestRedirect,
  }
};

/**
 * Wrapper para fetch que resolve problemas específicos do Firefox
 */
export const firefoxFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const isFF = isFirefox();
  
  if (!isFF) {
    // Se não é Firefox, usa fetch normal
    return fetch(url, options);
  }

  // Configurações específicas para Firefox
  const firefoxOptions: RequestInit = {
    ...options,
    ...FIREFOX_CONFIG.FETCH_OPTIONS,
    headers: {
      ...FIREFOX_CONFIG.HEADERS,
      ...options.headers,
    },
  };

  // Remove AbortController se existir para evitar NS_BINDING_ABORTED
  if (firefoxOptions.signal) {
    console.log('🦊 Firefox: Removendo AbortController para evitar NS_BINDING_ABORTED');
    delete firefoxOptions.signal;
  }

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= FIREFOX_CONFIG.MAX_RETRIES; attempt++) {
    try {
      console.log(`🦊 Firefox: Tentativa ${attempt}/${FIREFOX_CONFIG.MAX_RETRIES} para ${url}`);
      
      // Criar uma Promise com timeout manual para Firefox
      const fetchPromise = fetch(url, firefoxOptions);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Firefox timeout'));
        }, FIREFOX_CONFIG.REQUEST_TIMEOUT);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (response.ok) {
        console.log(`✅ Firefox: Sucesso na tentativa ${attempt}`);
        return response;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      console.warn(`⚠️ Firefox: Erro na tentativa ${attempt}:`, lastError.message);
      
      // Se não é a última tentativa, aguarda antes de tentar novamente
      if (attempt < FIREFOX_CONFIG.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, FIREFOX_CONFIG.RETRY_DELAY));
      }
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  throw lastError || new Error('Todas as tentativas falharam no Firefox');
};

/**
 * Wrapper para AbortController que funciona melhor no Firefox
 */
export class FirefoxAbortController {
  private _aborted = false;
  private _reason: any = undefined;
  private _listeners: (() => void)[] = [];

  get signal(): AbortSignal {
    const signal = {
      aborted: this._aborted,
      reason: this._reason,
      addEventListener: (type: string, listener: () => void) => {
        if (type === 'abort') {
          this._listeners.push(listener);
        }
      },
      removeEventListener: (type: string, listener: () => void) => {
        if (type === 'abort') {
          const index = this._listeners.indexOf(listener);
          if (index > -1) {
            this._listeners.splice(index, 1);
          }
        }
      },
      dispatchEvent: () => true,
      onabort: null,
      throwIfAborted: () => {
        if (this._aborted) {
          throw new Error('Aborted');
        }
      }
    } as AbortSignal;

    return signal;
  }

  abort(reason?: any) {
    if (this._aborted) return;
    
    this._aborted = true;
    this._reason = reason;
    
    // Notifica todos os listeners
    this._listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.warn('Erro ao executar listener de abort:', error);
      }
    });
  }
}

/**
 * Função para fazer requisições HTTP compatíveis com Firefox
 */
export const makeFirefoxRequest = async <T>(
  url: string,
  options: RequestInit & { 
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> => {
  const {
    timeout = FIREFOX_CONFIG.REQUEST_TIMEOUT,
    retries = FIREFOX_CONFIG.MAX_RETRIES,
    retryDelay = FIREFOX_CONFIG.RETRY_DELAY,
    ...fetchOptions
  } = options;

  const isFF = isFirefox();
  
  if (isFF) {
    console.log('🦊 Firefox detectado, usando configurações otimizadas');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await firefoxFetch(url, {
        ...fetchOptions,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(isFF ? FIREFOX_CONFIG.HEADERS : {}),
          ...fetchOptions.headers,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      
      // Log específico para Firefox
      if (isFF) {
        console.warn(`🦊 Firefox: Erro na tentativa ${attempt}/${retries}:`, lastError.message);
        
        // Detecta erros específicos do Firefox
        if (lastError.message.includes('NS_BINDING_ABORTED')) {
          console.warn('🦊 Firefox: Detectado erro NS_BINDING_ABORTED');
        }
      }

      // Se não é a última tentativa, aguarda antes de tentar novamente
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError || new Error('Todas as tentativas falharam');
};

/**
 * Hook para detectar problemas específicos do Firefox
 */
export const useFirefoxCompatibility = () => {
  const isFF = isFirefox();
  const isFFMobile = isFirefoxMobile();

  return {
    isFirefox: isFF,
    isFirefoxMobile: isFFMobile,
    shouldUseFirefoxFetch: isFF,
    firefoxConfig: FIREFOX_CONFIG,
    makeRequest: makeFirefoxRequest,
    createAbortController: () => isFF ? new FirefoxAbortController() : new AbortController(),
  };
};

/**
 * Middleware para interceptar e corrigir erros específicos do Firefox
 */
export const firefoxErrorHandler = (error: unknown): Error => {
  if (!(error instanceof Error)) {
    return new Error('Erro desconhecido');
  }

  // Trata erros específicos do Firefox
  if (error.message.includes('NS_BINDING_ABORTED')) {
    return new Error('Conexão interrompida. Tente novamente.');
  }

  if (error.message.includes('NetworkError')) {
    return new Error('Erro de rede. Verifique sua conexão.');
  }

  if (error.message.includes('Firefox timeout')) {
    return new Error('Tempo limite excedido. Tente novamente.');
  }

  return error;
};

/**
 * Configuração global para Firefox
 */
export const initFirefoxCompatibility = () => {
  if (!isFirefox()) return;

  console.log('🦊 Inicializando compatibilidade com Firefox');

  // Intercepta erros globais relacionados ao Firefox
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('NS_BINDING_ABORTED')) {
      console.warn('🦊 Firefox: Interceptado erro NS_BINDING_ABORTED global');
      event.preventDefault();
    }
  });

  // Intercepta promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('NS_BINDING_ABORTED')) {
      console.warn('🦊 Firefox: Interceptado promise rejection NS_BINDING_ABORTED');
      event.preventDefault();
    }
  });

  console.log('✅ Compatibilidade com Firefox inicializada');
}; 