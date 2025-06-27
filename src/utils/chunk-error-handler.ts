/**
 * Handler específico para erros de chunk loading e originalFactory
 * Importado automaticamente no layout.tsx
 */

// Verificar se já foi inicializado para evitar múltiplas inicializações
let initialized = false;

function isChunkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  
  return (
    error.name === 'ChunkLoadError' ||
    errorMessage.includes('Loading chunk') ||
    errorMessage.includes('ChunkLoadError') ||
    errorMessage.includes('originalFactory is undefined') ||
    errorMessage.includes("can't access property \"call\", originalFactory is undefined") ||
    errorMessage.includes('Cannot read properties of undefined (reading \'call\')') ||
    errorMessage.includes('Loading CSS chunk') ||
    errorMessage.includes('MIME type (\'text/css\') is not executable') ||
    errorMessage.includes('strict MIME type checking is enabled') ||
    error.code === 'CHUNK_LOAD_FAILED' ||
    // Adicionar verificação para erros de factory
    errorMessage.includes('options.factory') ||
    errorMessage.includes('__webpack_require__')
  );
}

function isCSSMimeError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  
  return (
    errorMessage.includes('MIME type (\'text/css\') is not executable') ||
    errorMessage.includes('strict MIME type checking is enabled') ||
    errorMessage.includes('vendors-node_modules') ||
    errorMessage.includes('.css') && errorMessage.includes('execute script')
  );
}

function handleChunkError(error: any, source: string) {
  if (!isChunkError(error) && !isCSSMimeError(error)) return false;
  
  console.warn(`🔄 Erro de chunk/CSS detectado (${source}):`, error.message);
  
  // Para erros de CSS MIME type, tentar recarregar imediatamente
  if (isCSSMimeError(error)) {
    console.log('🔄 Erro de MIME type CSS detectado - recarregando imediatamente...');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return true;
  }
  
  // Para outros erros de chunk, aguardar um pouco
  setTimeout(() => {
    console.log('🔄 Recarregando página devido a erro de chunk...');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, 1000);
  
  return true;
}

function setupChunkErrorHandler() {
  if (typeof window === 'undefined' || initialized) return;
  
  try {
    // Handler para erros globais
    window.addEventListener('error', (event) => {
      if (handleChunkError(event.error, 'global error')) {
        event.preventDefault();
      }
    });

    // Handler para promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (handleChunkError(event.reason, 'unhandled rejection')) {
        event.preventDefault();
      }
    });

    // Handler para erros de script loading
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as any).tagName === 'SCRIPT') {
        const script = event.target as HTMLScriptElement;
        if (script.src && (script.src.includes('chunk') || script.src.includes('_next'))) {
          console.warn('🔄 Erro ao carregar script:', script.src);
          
          // Verificar se é erro de CSS sendo executado como JS
          if (script.src.includes('.css')) {
            console.warn('🔄 Detectado CSS sendo carregado como script - recarregando...');
            window.location.reload();
            return;
          }
          
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    }, true);

    // Handler específico para erros de link (CSS)
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as any).tagName === 'LINK') {
        const link = event.target as HTMLLinkElement;
        if (link.href && link.href.includes('_next/static/css')) {
          console.warn('🔄 Erro ao carregar CSS:', link.href);
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    }, true);

    // Override console.error para capturar erros específicos
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      
      if (message.includes('MIME type') && message.includes('text/css') && message.includes('not executable')) {
        console.warn('🔄 Erro de MIME type CSS detectado via console.error - recarregando...');
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 100);
      }
      
      // Chamar o console.error original
      originalConsoleError.apply(console, args);
    };

    // Interceptar o MutationObserver para detectar scripts CSS malformados
    const originalObserver = window.MutationObserver;
    window.MutationObserver = class extends originalObserver {
      constructor(callback) {
        super((mutations) => {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(node => {
                if (node.tagName === 'SCRIPT' && node.src && node.src.includes('.css')) {
                  console.warn('🔄 Script CSS malformado detectado:', node.src);
                  setTimeout(() => window.location.reload(), 100);
                }
              });
            }
          });
          callback(mutations);
        });
      }
    };

    // Interceptar fetch para detectar requests CSS malformados
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const url = typeof input === 'string' ? input : input.url;
      
      if (url.includes('/_next/static/css/') && url.includes('.css')) {
        console.log('🔍 Interceptando request CSS:', url);
        
        return originalFetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            'Accept': 'text/css,*/*;q=0.1',
          }
        }).catch(error => {
          if (error.message.includes('MIME') || error.message.includes('css')) {
            console.warn('🔄 Erro de CSS fetch detectado, recarregando...');
            setTimeout(() => window.location.reload(), 100);
          }
          throw error;
        });
      }
      
      return originalFetch(input, init);
    };

    initialized = true;
    console.log('✅ Handler de chunk errors aprimorado inicializado');
    
  } catch (error) {
    console.error('❌ Erro ao configurar handler de chunk errors:', error);
  }
}

// Auto-inicializar quando o módulo for importado
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupChunkErrorHandler);
  } else {
    setupChunkErrorHandler();
  }
}

export { setupChunkErrorHandler, isChunkError, handleChunkError }; 