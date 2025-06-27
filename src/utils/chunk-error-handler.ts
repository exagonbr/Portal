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
    errorMessage.includes('Loading CSS chunk') ||
    error.code === 'CHUNK_LOAD_FAILED'
  );
}

function handleChunkError(error: any, source: string) {
  if (!isChunkError(error)) return false;
  
  console.warn(`🔄 Erro de chunk detectado (${source}):`, error.message);
  
  // Tentar recarregar a página após um pequeno delay
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
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    }, true);

    initialized = true;
    console.log('✅ Handler de chunk errors inicializado');
    
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