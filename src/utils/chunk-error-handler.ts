/**
 * Handler específico para erros de chunk loading e originalFactory
 */

// Verificar se já foi inicializado para evitar múltiplas inicializações
let initialized = false;
let errorCount = 0;
const MAX_ERRORS = 3;
const ERROR_RESET_TIME = 30000; // 30 segundos

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
    // Verificações específicas para erros de factory/webpack
    errorMessage.includes('options.factory') ||
    errorMessage.includes('__webpack_require__') ||
    errorMessage.includes('webpack.js') ||
    errorMessage.includes('expected expression, got') ||
    // Verificações adicionais para erros de originalFactory
    errorMessage.includes('originalFactory') ||
    errorMessage.includes('factory is undefined') ||
    errorMessage.includes('Module build failed')
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
  
  const errorMessage = error.message || error.toString();
  console.warn(`⚠️ Erro de chunk/CSS detectado (${source}):`, errorMessage);
  console.warn(`⚠️ Recarregamento automático DESABILITADO - usuário deve recarregar manualmente`);
  
  // DESABILITADO: Não fazer mais recarregamento automático
  // Apenas logar o erro para debug
  
  return true;
}

export function initializeChunkErrorHandler() {
  if (initialized || typeof window === 'undefined') return;

  // Detectar se é dispositivo móvel
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);

  // Handler para erros de window
  const handleError = (event: ErrorEvent) => {
    if (isChunkError(event.error)) {
      errorCount++;
      console.warn(`🔄 Erro de chunk detectado (${errorCount}/${MAX_ERRORS}):`, event.error.message);
      
      event.preventDefault();

      // Em dispositivos móveis, tentar recarregar imediatamente no primeiro erro
      if (isMobile && errorCount === 1) {
        console.log('📱 Erro de chunk em dispositivo móvel, recarregando...');
        window.location.reload();
        return;
      }

      // Para outros casos, seguir lógica normal
      if (errorCount >= MAX_ERRORS) {
        console.log('❌ Muitos erros de chunk, recarregando página...');
        window.location.reload();
      }
    }
  };

  // Handler para promise rejections
  const handleRejection = (event: PromiseRejectionEvent) => {
    if (isChunkError(event.reason)) {
      errorCount++;
      console.warn(`🔄 ChunkLoadError em promise (${errorCount}/${MAX_ERRORS}):`, event.reason);
      
      event.preventDefault();

      // Em dispositivos móveis, tentar recarregar imediatamente no primeiro erro
      if (isMobile && errorCount === 1) {
        console.log('📱 Erro de chunk em promise em dispositivo móvel, recarregando...');
        window.location.reload();
        return;
      }

      // Para outros casos, seguir lógica normal
      if (errorCount >= MAX_ERRORS) {
        console.log('❌ Muitos erros de chunk em promises, recarregando página...');
        window.location.reload();
      }
    }
  };

  // Resetar contador periodicamente
  const resetInterval = setInterval(() => {
    if (errorCount > 0) {
      console.log(`🔄 Resetando contador de erros de chunk (era ${errorCount})`);
      errorCount = 0;
    }
  }, ERROR_RESET_TIME);

  // Adicionar listeners
  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);

  // Marcar como inicializado
  initialized = true;
  console.log('✅ Handler de erros de chunk inicializado');

  // Retornar função de cleanup
  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
    clearInterval(resetInterval);
    initialized = false;
  };
}

// DESABILITADO: Não auto-inicializar mais
// if (typeof window !== 'undefined') {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', setupChunkErrorHandler);
//   } else {
//     setupChunkErrorHandler();
//   }
// }

export { setupChunkErrorHandler, isChunkError, handleChunkError };

// Função para tentar recarregar um chunk que falhou
export const retryChunkLoad = async (chunkId: string, maxRetries = 3): Promise<void> => {
  let retries = 0;
  
  const tryLoadChunk = async (): Promise<void> => {
    try {
      // Tentar carregar o chunk novamente
      const chunkUrl = `/_next/static/chunks/${chunkId}`;
      const response = await fetch(chunkUrl, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load chunk: ${response.status}`);
      }
      
      // Se chegou aqui, o chunk foi carregado com sucesso
      console.log(`Chunk ${chunkId} recarregado com sucesso`);
      
    } catch (error) {
      retries++;
      console.warn(`Tentativa ${retries} de ${maxRetries} falhou ao carregar chunk ${chunkId}:`, error);
      
      if (retries < maxRetries) {
        // Esperar um tempo antes de tentar novamente (backoff exponencial)
        const delay = Math.min(1000 * Math.pow(2, retries), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return tryLoadChunk();
      } else {
        throw new Error(`Falha ao carregar chunk após ${maxRetries} tentativas`);
      }
    }
  };
  
  return tryLoadChunk();
};

// Função para limpar o cache de chunks
export const clearChunksCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.includes('next-chunks'))
          .map(name => caches.delete(name))
      );
      console.log('Cache de chunks limpo com sucesso');
    } catch (error) {
      console.error('Erro ao limpar cache de chunks:', error);
    }
  }
};

// Inicializar handler global para erros de chunk
export const initializeChunkErrorHandlerGlobal = (): void => {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', async (event) => {
      const { message, filename } = event;
      
      // Verificar se é um erro de carregamento de chunk
      if (
        message.includes('Loading chunk') &&
        message.includes('failed') &&
        filename?.includes('/_next/static/chunks/')
      ) {
        event.preventDefault();
        
        try {
          // Extrair o ID do chunk da URL
          const chunkId = filename.split('/').pop()?.split('.')[0];
          if (chunkId) {
            await retryChunkLoad(chunkId);
            // Se chegou aqui, o chunk foi recarregado com sucesso
            window.location.reload();
          }
        } catch (error) {
          console.error('Falha ao recuperar do erro de chunk:', error);
          // Limpar cache e recarregar como última tentativa
          await clearChunksCache();
          window.location.reload();
        }
      }
    });
  }
}; 