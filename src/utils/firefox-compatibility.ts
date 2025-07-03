/**
 * Utilitários para compatibilidade com Firefox
 * Resolve problemas específicos do Firefox, incluindo NS_BINDING_ABORTED
 * e problemas de CORS
 */

// Detecta se o navegador é Firefox
export const isFirefox = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.includes('Firefox');
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

// Cache para detectar se já foi inicializado
let initialized = false;

/**
 * Configuração global para resolver NS_BINDING_ABORT
 */
export function initializeFirefoxCompatibility() {
  if (initialized || typeof window === 'undefined') return;
  
  // Só inicializar se realmente for Firefox
  if (!isFirefox()) {
    console.log('🌐 Não é Firefox, pulando inicialização específica');
    return;
  }
  
  console.log('🦊 Inicializando compatibilidade com Firefox...');
  
  // 1. Interceptar e corrigir fetch para evitar NS_BINDING_ABORT e NetworkError
  const originalFetch = window.fetch;
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const requestInit = { ...init };
    
    // Extrair URL da requisição
    const url = typeof input === 'string' ? input : 
               input instanceof URL ? input.href : 
               (input as Request).url;
    
    // Para requisições de API internas, aplicar apenas correções mínimas do Firefox
    if (url && (url.includes('/api/') || url.startsWith('/api'))) {
      if (isFirefox() && requestInit.signal) {
        console.log('🦊 Firefox: Removendo AbortController para API interna');
        delete requestInit.signal;
      }
      
      // Preservar credentials originais para APIs internas
      const apiInit: RequestInit = {
        ...requestInit,
        mode: requestInit.mode || 'cors',
        credentials: requestInit.credentials || 'include',
      };
      
      return originalFetch(input, apiInit);
    }
    
    // Para requisições externas, aplicar configurações mais restritivas
    if (isFirefox() && requestInit.signal) {
      console.log('🦊 Firefox: Removendo AbortController para requisição externa');
      delete requestInit.signal;
    }
    
    // Configurar headers de forma mais inteligente
    const headers = new Headers(requestInit.headers || {});
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json, text/plain, */*');
    }
    
    // Configurações otimizadas para requisições externas
    const finalInit: RequestInit = {
      ...requestInit,
      headers,
      mode: 'cors',
      credentials: 'same-origin',
      cache: 'no-cache',
      redirect: 'follow',
      referrerPolicy: 'no-referrer-when-downgrade'
    };
    
    try {
      return await originalFetch(input, finalInit);
    } catch (error: any) {
      // Tratamento de erros específicos do Firefox
      if (isFirefox() && error.message?.includes('NS_BINDING_ABORTED')) {
        console.warn('🦊 Firefox: Erro NS_BINDING_ABORTED interceptado');
        return new Response(JSON.stringify({ error: 'Request cancelled by browser' }), {
          status: 499,
          statusText: 'Client Closed Request',
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Retry para NetworkError com configurações mais simples
      if (error.message?.includes('NetworkError')) {
        console.warn('🌐 NetworkError detectado, tentando configuração alternativa');
        
        try {
          const retryInit: RequestInit = {
            method: requestInit.method || 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors',
            credentials: 'omit'
          };
          
          if (requestInit.body) retryInit.body = requestInit.body;
          
          return await originalFetch(input, retryInit);
        } catch (retryError) {
          throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
        }
      }
      
      throw error;
    }
  };
  
  // 2. Interceptar XMLHttpRequest para compatibilidade (DESABILITADO temporariamente)
  // NOTA: Interceptação do XMLHttpRequest pode causar conflitos com outras bibliotecas
  // Mantendo código comentado para referência futura
  
  // 3. NÃO substituir AbortController globalmente para evitar conflitos com outras bibliotecas
  // Em vez disso, usar uma implementação específica apenas quando necessário
  
  // 4. Interceptar erros globais relacionados ao NS_BINDING_ABORT
  window.addEventListener('error', (event) => {
    if (isFirefox() && event.error?.message?.includes('NS_BINDING_ABORTED')) {
      console.warn('🦊 Firefox: Interceptado erro NS_BINDING_ABORTED global');
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });
  
  // 5. Interceptar promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isFirefox() && event.reason?.message?.includes('NS_BINDING_ABORTED')) {
      console.warn('🦊 Firefox: Interceptado promise rejection NS_BINDING_ABORTED');
      event.preventDefault();
      return false;
    }
  });
  
  initialized = true;
  console.log('✅ Compatibilidade com Firefox inicializada');
}

/**
 * Utilitários específicos para Firefox
 */
export const FirefoxUtils = {
  isFirefox: isFirefox(),
  
  // Criar fetch seguro para Firefox
  safeFetch: async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const requestInit = { ...init };
    
    // Remover AbortController no Firefox para evitar NS_BINDING_ABORTED
    if (isFirefox() && requestInit.signal) {
      delete requestInit.signal;
    }
    
    // Configurações seguras para todos os navegadores
    const safeInit: RequestInit = {
      ...requestInit,
      mode: requestInit.mode || 'cors',
      credentials: requestInit.credentials || 'same-origin',
      cache: 'no-cache',
      redirect: 'follow',
      referrerPolicy: 'no-referrer-when-downgrade'
    };
    
    try {
      return await fetch(input, safeInit);
    } catch (error: any) {
      // Tratamento específico para NetworkError
      if (error.message?.includes('NetworkError')) {
        console.warn('🔄 SafeFetch: NetworkError detectado, tentando configuração mínima');
        
        try {
          const minimalInit: RequestInit = {
            method: requestInit.method || 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors',
            credentials: 'omit'
          };
          
          if (requestInit.body) minimalInit.body = requestInit.body;
          
          return await fetch(input, minimalInit);
        } catch (retryError) {
          throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
        }
      }
      
      throw error;
    }
  },
  
  // Criar AbortController seguro - não usar no Firefox para evitar NS_BINDING_ABORT
  createAbortController: () => {
    if (isFirefox()) {
      console.log('🦊 Firefox: AbortController desabilitado para evitar NS_BINDING_ABORT');
      return null;
    }
    return new AbortController();
  },
  
  // Verificar se um erro é NS_BINDING_ABORT
  isNSBindingAbortError: (error: any): boolean => {
    return error && typeof error.message === 'string' && 
           error.message.includes('NS_BINDING_ABORTED');
  },
  
  // Tratar erro de forma segura
  handleError: (error: any): Error => {
    if (FirefoxUtils.isNSBindingAbortError(error)) {
      console.warn('🦊 Firefox: Erro NS_BINDING_ABORTED tratado');
      return new Error('Request cancelled by browser');
    }
    return error;
  }
};

/**
 * Interceptar erros de fetch globalmente
 */
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;
  
  // Interceptar erros globais
  window.addEventListener('error', (event) => {
    if (event.error?.message?.includes('NS_BINDING_ABORTED')) {
      console.warn('🦊 Firefox: Interceptado erro NS_BINDING_ABORTED global');
      event.preventDefault();
      return false;
    }
  });
  
  // Interceptar promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('NS_BINDING_ABORTED')) {
      console.warn('🦊 Firefox: Interceptado promise rejection NS_BINDING_ABORTED');
      event.preventDefault();
      return false;
    }
  });
}

// Auto-inicializar quando o módulo for carregado no browser
if (typeof window !== 'undefined') {
  const init = () => {
    if (isFirefox()) {
      console.log('🦊 Firefox detectado, inicializando compatibilidade');
      initializeFirefoxCompatibility();
    }
    setupGlobalErrorHandling();
  };
  
  // Aguardar o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
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
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await FirefoxUtils.safeFetch(url, {
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

      return await response.json();

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      
      // Para erros específicos do Firefox, não fazer retry
      if (isFF && lastError.message.includes('NS_BINDING_ABORTED')) {
        throw new Error('Conexão interrompida pelo navegador');
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
    createAbortController: () => isFF ? FirefoxUtils.createAbortController() : new AbortController(),
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
 * Alias para initializeFirefoxCompatibility para compatibilidade com código existente
 */
export const initFirefoxCompatibility = initializeFirefoxCompatibility;

/**
 * Alias para FirefoxUtils.safeFetch para compatibilidade com código existente
 */
export const firefoxFetch = FirefoxUtils.safeFetch; 