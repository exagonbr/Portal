// Utilitário para tratar erros de carregamento de chunks
export function handleChunkLoadError() {
  if (typeof window !== 'undefined') {
    // Detectar erros de carregamento de chunks
    window.addEventListener('error', (event) => {
      const target = event.target || event.srcElement;
      
      // Verificar se é um erro de carregamento de script
      if (target && (target as any).tagName === 'SCRIPT') {
        const src = (target as HTMLScriptElement).src;
        
        // Se for um chunk do Next.js que falhou
        if (src && src.includes('/_next/static/chunks/')) {
          console.warn('🔄 Erro de carregamento de chunk detectado, tentando recarregar...', src);
          
          // Tentar recarregar a página após um pequeno delay
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    });

    // Detectar erros de promise rejection não tratados (relacionados a chunks)
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      
      // Verificar se é um erro relacionado a carregamento de módulos
      if (reason && typeof reason === 'object' && reason.message) {
        const message = reason.message.toLowerCase();
        
        if (message.includes('loading chunk') || 
            message.includes('factory') || 
            message.includes('webpack')) {
          console.warn('🔄 Erro de carregamento de módulo detectado:', reason.message);
          
          // Prevenir que o erro seja mostrado no console
          event.preventDefault();
          
          // Tentar recarregar após delay
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    });
  }
}

// Auto-inicializar quando o módulo for carregado
if (typeof window !== 'undefined') {
  handleChunkLoadError();
} 