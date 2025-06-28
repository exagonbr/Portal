'use client'

/**
 * Utilitário para tratamento de erros específicos do sistema
 */

// Erros conhecidos que podem ser tratados de forma especial
export const KNOWN_ERRORS = {
  FACTORY_ERROR: "can't access property \"call\", originalFactory is undefined",
  CHUNK_LOAD_ERROR: "Loading chunk",
  UNDEFINED_PROPS: "Cannot read properties of undefined",
  MIME_TYPE_ERROR: "MIME type"
}

// Verifica se o erro é um erro de factory
export function isFactoryError(error: Error | unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  return errorMessage.includes(KNOWN_ERRORS.FACTORY_ERROR) || 
         errorMessage.includes("originalFactory");
}

// Verifica se o erro é um erro de carregamento de chunk
export function isChunkError(error: Error | unknown): boolean {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : '';
  
  return errorMessage.includes(KNOWN_ERRORS.CHUNK_LOAD_ERROR) || 
         errorMessage.includes(KNOWN_ERRORS.FACTORY_ERROR) ||
         errorMessage.includes("originalFactory") ||
         errorMessage.includes(KNOWN_ERRORS.UNDEFINED_PROPS) ||
         errorMessage.includes(KNOWN_ERRORS.MIME_TYPE_ERROR) ||
         errorName === 'ChunkLoadError';
}

// Gerencia tentativas de recuperação automática
export function manageRecoveryAttempts(): boolean {
  if (typeof window === 'undefined') return false;
  
  const recoveryKey = 'errorRecoveryAttempts';
  const recoveryAttempts = parseInt(sessionStorage.getItem(recoveryKey) || '0');
  
  if (recoveryAttempts < 3) {
    sessionStorage.setItem(recoveryKey, (recoveryAttempts + 1).toString());
    
    // Limpar contador após 2 minutos
    setTimeout(() => {
      sessionStorage.removeItem(recoveryKey);
    }, 120000);
    
    return true; // Pode tentar recuperar
  }
  
  return false; // Muitas tentativas, não recuperar
}

// Tenta recuperar de um erro recarregando a página
export function recoverFromError(delay: number = 2000): void {
  if (typeof window === 'undefined') return;
  
  if (manageRecoveryAttempts()) {
    console.log(`🔄 Tentando recuperar de erro, recarregando em ${delay}ms...`);
    
    setTimeout(() => {
      window.location.reload();
    }, delay);
  } else {
    console.warn('⚠️ Muitas tentativas de recuperação, parando ciclo de recarregamento');
  }
}

// Manipulador global de erros para erros de factory e chunk
export function setupGlobalErrorHandler(): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const handleError = (event: ErrorEvent) => {
    if (!event.error) return;
    
    if (isFactoryError(event.error) || isChunkError(event.error)) {
      console.warn('⚠️ Erro de factory/chunk detectado pelo manipulador global');
      event.preventDefault();
      recoverFromError();
    }
  };
  
  window.addEventListener('error', handleError);
  
  // Retorna função para remover o listener
  return () => window.removeEventListener('error', handleError);
} 