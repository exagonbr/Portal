/**
 * Handler específico para erros de chunk loading e originalFactory
 * DESABILITADO para evitar recarregamentos automáticos excessivos
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

function setupChunkErrorHandler() {
  // DESABILITADO: Não configurar mais handlers automáticos
  console.log('⚠️ Chunk error handler DESABILITADO para evitar recarregamentos excessivos');
  
  if (typeof window === 'undefined' || initialized) return;
  
  // Apenas logar que o handler foi desabilitado
  initialized = true;
  console.log('✅ Handler de chunk errors DESABILITADO - sem recarregamentos automáticos');
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