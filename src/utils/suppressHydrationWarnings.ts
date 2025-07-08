// Estender a interface Window para incluir nossa propriedade personalizada
declare global {
  interface Window {
    _originalConsoleError?: typeof console.error;
  }
}

/**
 * Suprime avisos de hidratação específicos em desenvolvimento
 * Use apenas quando os avisos são inevitáveis e você tem certeza de que não afetam a funcionalidade
 */
export function suppressHydrationWarnings() {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return;
  }

  // Capturar console.error original
  const originalError = console.error;

  // Armazenar o console.error original em uma propriedade para restauração posterior
  if (!window._originalConsoleError) {
    window._originalConsoleError = originalError;
  }

  console.error = function(...args: any[]) {
    // Suprimir avisos específicos de hidratação que são conhecidos e seguros
    const message = args[0];
    
    if (typeof message === 'string') {
      // Avisos de hidratação relacionados a IDs únicos, timestamps, extensões do navegador, etc.
      const hydrationWarnings = [
        'A tree hydrated but some attributes of the server rendered HTML didn\'t match the client properties',
        'Text content does not match server-rendered HTML',
        'Hydration failed because the initial UI does not match what was rendered on the server',
        'There was an error while hydrating',
        'Hydration failed because the server rendered HTML didn\'t match the client',
        'bbai-tooltip-injected', // Extensão BBAI
        'data-grammarly', // Grammarly
        'data-lastpass', // LastPass
        'data-extension', // Extensões genéricas
        'Warning: Extra attributes from the server', // Atributos extras do servidor
        'Warning: Prop `className` did not match', // Classes CSS diferentes
        'Warning: Expected server HTML to contain a matching', // HTML não correspondente
        'Token de autenticação não encontrado', // Erro de autenticação
        'CLIENT_FETCH_ERROR', // Erros de fetch do NextAuth
        'next-auth', // Erros gerais do NextAuth
        'Nenhuma sessão ativa encontrada', // Erro de sessão customizada
        '[next-auth][error]', // Prefixo de erro do NextAuth
        'NEXTAUTH_SECRET', // Erro de configuração do NextAuth
        'https://next-auth.js.org/errors', // Links de erro do NextAuth
        'SIGNIN_OAUTH_ERROR', // Erro OAuth do NextAuth
        'OAUTH_CALLBACK_ERROR', // Erro de callback OAuth
        'SIGNIN_EMAIL_ERROR', // Erro de signin por email
        'CALLBACK_CREDENTIALS_JWT_ERROR', // Erro de JWT
        'CALLBACK_CREDENTIALS_HANDLER_ERROR', // Erro no handler de credenciais
        'No session found', // Sessão não encontrada (inglês)
        'Failed to fetch session', // Falha ao buscar sessão
        'Erro na resposta da API de detalhes: 401', // Erro 401 na API de detalhes
        'Erro de autenticação (401) ao carregar detalhes', // Erro específico que está ocorrendo
        'Falha ao atualizar token', // Erro específico na função tryRefreshToken
        'Erro ao tentar atualizar token', // Erro específico na função tryRefreshToken
      ];

      // Se é um aviso de hidratação conhecido, não mostrar
      if (hydrationWarnings.some(warning => message.includes(warning))) {
        return;
      }

      // Suprimr erros específicos de NextAuth baseados no formato
      if (message.startsWith('[next-auth]')) {
        return;
      }

      // Suprimir avisos de fetch que são específicos de autenticação
      if (message.includes('fetch') && message.includes('auth')) {
        return;
      }
      
      // Suprimir erros 401 (não autorizados)
      if ((message.includes('401') || message.includes('Unauthorized') || 
           message.includes('autenticação') || message.includes('authentication')) && 
          (message.includes('API') || message.includes('fetch') || message.includes('carregar') || 
           message.includes('load') || message.includes('detalhes'))) {
        return;
      }
      
      // Verificar especificamente o erro que está ocorrendo
      if (message.includes('❌ Erro de autenticação (401)')) {
        return;
      }
      
      // Suprimir erros relacionados à atualização de token
      if (message.includes('token') && (message.includes('atualizar') || message.includes('refresh'))) {
        return;
      }
    }

    // Para outros erros, usar comportamento normal
    originalError.call(console, ...args);
  };
}

/**
 * Restaura o console.error original
 */
export function restoreConsoleError() {
  if (typeof window === 'undefined') {
    return;
  }

  // Restaurar o console.error original se ele foi armazenado
  if (window._originalConsoleError) {
    console.error = window._originalConsoleError;
    delete window._originalConsoleError;
  }
} 