/**
 * Utilitário para lidar com ChunkLoadError e retry de importações dinâmicas
 */

export interface ChunkRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, error: Error) => void;
  onSuccess?: (attempt: number) => void;
  onFailure?: (error: Error) => void;
}

/**
 * Verifica se o erro é um ChunkLoadError
 */
export function isChunkLoadError(error: any): boolean {
  return (
    error &&
    (error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('ChunkLoadError') ||
      error.code === 'CHUNK_LOAD_FAILED')
  );
}

/**
 * Implementa retry para importações dinâmicas com tratamento de ChunkLoadError
 */
export async function retryDynamicImport<T>(
  importFn: () => Promise<T>,
  options: ChunkRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onRetry,
    onSuccess,
    onFailure
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await importFn();
      
      if (attempt > 1 && onSuccess) {
        onSuccess(attempt);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Se não é um erro de chunk, não vale a pena tentar novamente
      if (!isChunkLoadError(error)) {
        if (onFailure) {
          onFailure(lastError);
        }
        throw lastError;
      }

      // Se é a última tentativa, não esperar
      if (attempt === maxRetries) {
        break;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Aguardar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }

  if (onFailure) {
    onFailure(lastError);
  }
  
  throw lastError;
}

/**
 * Wrapper específico para importar o api-client com retry
 */
export async function importApiClient() {
  return retryDynamicImport(
    () => import('../lib/api-client'),
    {
      maxRetries: 3,
      retryDelay: 1000,
      onRetry: (attempt, error) => {
        console.warn(`⚠️ Tentativa ${attempt} de importar api-client falhou:`, error.message);
      },
      onSuccess: (attempt) => {
        if (attempt > 1) {
          console.log(`✅ Api-client importado com sucesso na tentativa ${attempt}`);
        }
      },
      onFailure: (error) => {
        console.error('❌ Falha ao importar api-client após todas as tentativas:', error);
      }
    }
  );
}

/**
 * Limpa o cache de chunks do webpack (se disponível)
 */
export function clearChunkCache(): void {
  if (typeof window !== 'undefined' && 'webpackChunkName' in window) {
    try {
      // Tentar limpar cache de chunks do webpack
      if ((window as any).__webpack_require__?.cache) {
        Object.keys((window as any).__webpack_require__.cache).forEach(key => {
          if (key.includes('api-client') || key.includes('auth')) {
            delete (window as any).__webpack_require__.cache[key];
          }
        });
        console.log('🧹 Cache de chunks limpo');
      }
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache de chunks:', error);
    }
  }
}

/**
 * Configura listener global para ChunkLoadError
 */
export function setupChunkErrorHandler(): void {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      if (isChunkLoadError(event.error)) {
        console.warn('🔄 ChunkLoadError detectado, tentando recarregar página...');
        
        // Aguardar um pouco antes de recarregar para evitar loop
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });

    // Listener para unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (isChunkLoadError(event.reason)) {
        console.warn('🔄 ChunkLoadError em promise rejeitada detectado');
        event.preventDefault(); // Previne o erro no console
        
        // Tentar recarregar a página como último recurso
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    });
  }
} 