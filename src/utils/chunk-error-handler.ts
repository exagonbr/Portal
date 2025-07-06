/**
 * Handler específico para erros de chunk loading
 */

// Verificar se já foi inicializado para evitar múltiplas inicializações
let initialized = false;
let errorCount = 0;
const MAX_ERRORS = 3;
const ERROR_RESET_TIME = 30000; // 30 segundos

// Constantes para configuração
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CACHE_PREFIX = '_next_chunk_retry_';

// Interface para o registro de tentativas
interface RetryRecord {
  count: number;
  timestamp: number;
}

// Cache para armazenar tentativas de retry
const retryCache = new Map<string, RetryRecord>();

/**
 * Limpa registros antigos do cache
 */
const cleanupCache = () => {
  const now = Date.now();
  const expiryTime = 1000 * 60 * 60; // 1 hora

  retryCache.forEach((record, key) => {
    if (now - record.timestamp > expiryTime) {
      retryCache.delete(key);
    }
  });
};

/**
 * Verifica se é um erro de carregamento de chunk
 */
const isChunkLoadError = (error: Error): boolean => {
  return (
    error.message.includes('Loading chunk') ||
    error.message.includes('Failed to fetch dynamically imported module') ||
    error.message.includes('Unexpected token') ||
    error.message.includes('ChunkLoadError')
  );
};

/**
 * Extrai o ID do chunk do erro
 */
const getChunkId = (error: Error): string | null => {
  const match = error.message.match(/Loading chunk (\d+) failed/);
  return match ? match[1] : null;
};

/**
 * Gera uma chave única para o cache
 */
const getCacheKey = (chunkId: string): string => {
  return `${CACHE_PREFIX}${chunkId}`;
};

/**
 * Verifica se deve tentar novamente carregar o chunk
 */
const shouldRetry = (chunkId: string): boolean => {
  const record = retryCache.get(getCacheKey(chunkId));
  
  if (!record) {
    return true;
  }

  return record.count < MAX_RETRIES;
};

/**
 * Registra uma tentativa de retry
 */
const recordRetry = (chunkId: string): void => {
  const key = getCacheKey(chunkId);
  const record = retryCache.get(key);

  if (record) {
    record.count += 1;
    record.timestamp = Date.now();
  } else {
    retryCache.set(key, {
      count: 1,
      timestamp: Date.now(),
    });
  }
};

/**
 * Limpa o cache do navegador
 */
const clearBrowserCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheKeys = await caches.keys();
      await Promise.all(
        cacheKeys.map(key => caches.delete(key))
      );
      console.log('✅ Cache do navegador limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar cache do navegador:', error);
    }
  }
};

/**
 * Recarrega os recursos do Next.js
 */
const reloadNextResources = async (): Promise<void> => {
  try {
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
      const buildId = JSON.parse(nextData.textContent || '').buildId;
      const manifestUrl = `/_next/static/${buildId}/_buildManifest.js`;
      await fetch(manifestUrl, { cache: 'reload' });
    }
  } catch (error) {
    console.error('❌ Erro ao recarregar recursos do Next.js:', error);
  }
};

/**
 * Função principal para lidar com erros de chunk
 */
export const handleChunkError = async (error: Error): Promise<boolean> => {
  // Limpar registros antigos do cache
  cleanupCache();

  // Verificar se é um erro de chunk
  if (!isChunkLoadError(error)) {
    return false;
  }

  // Extrair ID do chunk
  const chunkId = getChunkId(error);
  if (!chunkId) {
    return false;
  }

  // Verificar se deve tentar novamente
  if (!shouldRetry(chunkId)) {
    console.log(`⚠️ Máximo de tentativas atingido para o chunk ${chunkId}`);
    return false;
  }

  // Registrar tentativa
  recordRetry(chunkId);

  try {
    // Limpar cache do navegador
    await clearBrowserCache();
    
    // Recarregar recursos do Next.js
    await reloadNextResources();

    // Esperar antes de tentar novamente
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

    // Recarregar a página
    window.location.reload();
    
    return true;
  } catch (retryError) {
    console.error('❌ Erro ao tentar recuperar do erro de chunk:', retryError);
    return false;
  }
};

/**
 * Registra o handler global de erros
 */
export const registerGlobalErrorHandler = (): void => {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', async (event) => {
      if (await handleChunkError(event.error)) {
        event.preventDefault();
      }
    });

    window.addEventListener('unhandledrejection', async (event) => {
      if (event.reason instanceof Error) {
        if (await handleChunkError(event.reason)) {
          event.preventDefault();
        }
      }
    });
  }
};

/**
 * Função para detectar dispositivo móvel
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
};

/**
 * Função para limpar o cache de chunks
 */
export const clearChunkCache = (): void => {
  retryCache.clear();
  console.log('✅ Cache de chunks limpo');
};

// Exportar constantes úteis
export const CHUNK_ERROR_CONFIG = {
  MAX_RETRIES,
  RETRY_DELAY,
  CACHE_PREFIX,
};

// Função para verificar se é um erro de chunk
export const isChunkError = (error: any): boolean => {
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
};

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
export const initializeChunkErrorHandler = (): void => {
  if (initialized || typeof window === 'undefined') return;

  // Detectar se é dispositivo móvel
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);

  // Handler para erros de window
  const handleError = async (event: ErrorEvent) => {
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

      // Tentar recarregar o chunk se possível
      if (event.filename) {
        try {
          const chunkId = event.filename.split('/').pop()?.split('.')[0];
          if (chunkId) {
            await retryChunkLoad(chunkId);
            // Se chegou aqui, o chunk foi recarregado com sucesso
            window.location.reload();
            return;
          }
        } catch (error) {
          console.error('Falha ao recuperar do erro de chunk:', error);
        }
      }

      // Se chegou aqui, tentar limpar cache e recarregar
      if (errorCount >= MAX_ERRORS) {
        console.log('❌ Muitos erros de chunk, limpando cache e recarregando...');
        await clearChunksCache();
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
}; 