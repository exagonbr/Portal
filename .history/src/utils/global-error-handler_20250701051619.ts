/**
 * Global error handler para capturar e tratar erros de chunk loading
 */

import { isChunkLoadError } from './chunk-retry';

let errorHandlerInitialized = false;
let chunkErrorCount = 0;
const MAX_CHUNK_ERRORS = 3;

/**
 * Inicializa o handler global de erros
 */
export function initializeGlobalErrorHandler(): void {
  if (typeof window === 'undefined' || errorHandlerInitialized) {
    return;
  }

  console.log('🛡️ Inicializando handler global de erros...');

  // Handler para erros de script/chunk
  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.error)) {
      chunkErrorCount++;
      console.warn(`🔄 ChunkLoadError detectado (${chunkErrorCount}/${MAX_CHUNK_ERRORS}):`, event.error.message);
      
      // Prevenir que o erro apareça no console
      event.preventDefault();
      
      // Se exceder o limite, recarregar a página
      if (chunkErrorCount >= MAX_CHUNK_ERRORS) {
        console.log('❌ Muitos erros de chunk, recarregando página...');
        window.location.reload();
      }
    }
  });

  // Handler para promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason)) {
      chunkErrorCount++;
      console.warn(`🔄 ChunkLoadError em promise (${chunkErrorCount}/${MAX_CHUNK_ERRORS}):`, event.reason.message);
      
      // Prevenir que o erro apareça no console
      event.preventDefault();
      
      // Se exceder o limite, recarregar a página
      if (chunkErrorCount >= MAX_CHUNK_ERRORS) {
        console.log('❌ Muitos erros de chunk em promises, recarregando página...');
        window.location.reload();
      }
    }
  });

  // Handler para erros de resource loading
  window.addEventListener('error', (event) => {
    if (event.target && (event.target as any).tagName === 'SCRIPT') {
      const script = event.target as HTMLScriptElement;
      if (script.src && (script.src.includes('chunk') || script.src.includes('_next'))) {
        chunkErrorCount++;
        console.warn(`🔄 Erro ao carregar script (${chunkErrorCount}/${MAX_CHUNK_ERRORS}):`, script.src);
        
        // Se exceder o limite, recarregar a página
        if (chunkErrorCount >= MAX_CHUNK_ERRORS) {
          console.log('❌ Muitos erros de script, recarregando página...');
          window.location.reload();
        }
      }
    }
  }, true);

  // Reset do contador após um tempo sem erros
  setInterval(() => {
    if (chunkErrorCount > 0) {
      chunkErrorCount = Math.max(0, chunkErrorCount - 1);
    }
  }, 30000); // Reset gradual a cada 30 segundos

  errorHandlerInitialized = true;
  console.log('✅ Handler global de erros inicializado');
}

/**
 * Reseta o contador de erros
 */
export function resetErrorCount(): void {
  chunkErrorCount = 0;
  console.log('🔄 Contador de erros resetado');
}

/**
 * Obtém o número atual de erros
 */
export function getErrorCount(): number {
  return chunkErrorCount;
}
