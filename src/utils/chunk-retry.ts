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
 * Verifica se o erro é um ChunkLoadError ou originalFactory undefined
 */
export function isChunkLoadError(error: any): boolean {
  return (
    error &&
    (error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('ChunkLoadError') ||
      error.message?.includes('originalFactory is undefined') ||
      error.message?.includes("can't access property \"call\", originalFactory is undefined") ||
      error.message?.includes("Cannot read properties of undefined (reading 'call')") ||
      error.message?.includes("originalFactory.call is not a function") ||
      error.message?.includes("factory is undefined") ||
      error.code === 'CHUNK_LOAD_FAILED')
  );
}

/**
 * CORREÇÃO: Implementa retry mais robusto para importações dinâmicas
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

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // CORREÇÃO: Limpar cache antes de tentar novamente (exceto primeira tentativa)
      if (attempt > 1) {
        clearChunkCache();
      }
      
      const result = await importFn();
      
      // Verificar se o resultado é válido
      if (!result) {
        throw new Error('Import returned null or undefined');
      }
      
      // Verificar se o resultado tem as propriedades esperadas
      if (typeof result === 'object' && result !== null) {
        // Para imports de módulos, verificar se não está vazio
        const keys = Object.keys(result);
        if (keys.length === 0) {
          throw new Error('Import returned empty object');
        }
      }
      
      if (attempt > 1 && onSuccess) {
        onSuccess(attempt);
      }
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Log do erro para debug
      console.warn(`🔄 Tentativa ${attempt} falhou:`, {
        error: lastError.message,
        stack: lastError.stack?.substring(0, 200)
      });
      
      // Se não é um erro de chunk, não vale a pena tentar novamente
      if (!isChunkLoadError(error)) {
        console.error('❌ Erro não relacionado a chunk loading:', lastError);
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

      // Aguardar antes da próxima tentativa com backoff exponencial
      const delay = retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  if (lastError) {
    console.error('❌ Todas as tentativas falharam:', lastError);
    if (onFailure) {
      onFailure(lastError);
    }
    throw lastError;
  }
  
  // Se chegou aqui sem erro, retornar um valor padrão
  throw new Error('Retry function completed without success or error');
}

/**
 * Wrapper específico para importar o api-client com retry
 */
export async function importApiClient() {
  try {
    return await retryDynamicImport(
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
  } catch (error) {
    console.error('❌ Erro crítico ao importar api-client:', error);
    // Retornar um objeto mock para evitar crashes
    return {
      apiClient: {
        clearAuth: () => {
          console.warn('⚠️ Usando clearAuth mock devido a falha no import');
          if (typeof window !== 'undefined') {
            const keys = ['auth_token', 'token', 'authToken'];
            keys.forEach(key => {
              localStorage.removeItem(key);
              sessionStorage.removeItem(key);
            });
          }
        },
        setAuthToken: (token: string) => {
          console.warn('⚠️ Usando setAuthToken mock devido a falha no import');
          if (typeof window !== 'undefined' && token) {
            localStorage.setItem('auth_token', token);
          }
        }
      }
    };
  }
}

/**
 * CORREÇÃO: Limpa o cache de chunks do webpack de forma mais segura
 */
export function clearChunkCache(): void {
  if (typeof window !== 'undefined') {
    try {
      // Tentar limpar cache de chunks do webpack
      if ((window as any).__webpack_require__?.cache) {
        const cache = (window as any).__webpack_require__.cache;
        Object.keys(cache).forEach(key => {
          if (key.includes('api-client') || 
              key.includes('auth') ||
              key.includes('BookViewer') ||
              key.includes('chunk')) {
            try {
              delete cache[key];
            } catch (e) {
              // Ignorar erros de delete
            }
          }
        });
        console.log('🧹 Cache de chunks limpo');
      }

      // CORREÇÃO: Limpar também o cache de módulos se disponível
      if ((window as any).__webpack_require__?.moduleCache) {
        const moduleCache = (window as any).__webpack_require__.moduleCache;
        Object.keys(moduleCache).forEach(key => {
          if (key.includes('api-client') || 
              key.includes('auth') ||
              key.includes('BookViewer')) {
            try {
              delete moduleCache[key];
            } catch (e) {
              // Ignorar erros de delete
            }
          }
        });
      }
    } catch (error) {
      console.warn('⚠️ Erro ao limpar cache de chunks:', error);
    }
  }
}

/**
 * CORREÇÃO: Configura listener global mais robusto para ChunkLoadError
 * DESABILITADO para evitar recarregamentos automáticos excessivos
 */
export function setupChunkErrorHandler(): void {
  // DESABILITADO: Não configurar mais handlers automáticos
  console.log('⚠️ Chunk error handler (chunk-retry) DESABILITADO para evitar recarregamentos excessivos');
  
  // Apenas logar que foi desabilitado
  return;
  
  // CÓDIGO ORIGINAL COMENTADO:
  /*
  if (typeof window !== 'undefined') {
    // Listener para erros de script/chunk
    window.addEventListener('error', (event) => {
      if (isChunkLoadError(event.error)) {
        console.warn('🔄 ChunkLoadError detectado:', event.error.message);
        
        // Limpar cache antes de recarregar
        clearChunkCache();
        
        // Aguardar um pouco antes de recarregar para evitar loop
        setTimeout(() => {
          console.log('🔄 Recarregando página devido a ChunkLoadError...');
          window.location.reload();
        }, 1500);
      }
    });

    // Listener para unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (isChunkLoadError(event.reason)) {
        console.warn('🔄 ChunkLoadError em promise rejeitada:', event.reason.message);
        event.preventDefault(); // Previne o erro no console
        
        // Limpar cache
        clearChunkCache();
        
        // Tentar recarregar a página como último recurso
        setTimeout(() => {
          console.log('🔄 Recarregando página devido a promise rejection...');
          window.location.reload();
        }, 2000);
      }
    });

    // CORREÇÃO: Listener adicional para erros de resource loading
    window.addEventListener('error', (event) => {
      if (event.target && (event.target as any).tagName === 'SCRIPT') {
        const script = event.target as HTMLScriptElement;
        if (script.src && script.src.includes('chunk')) {
          console.warn('🔄 Erro ao carregar script chunk:', script.src);
          
          // Limpar cache e tentar recarregar após um delay
          clearChunkCache();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    }, true);
  }
  */
} 