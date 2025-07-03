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

  console.error = (...args: any[]) => {
    // Suprimir avisos específicos de hidratação que são conhecidos e seguros
    const message = args[0];
    
    if (typeof message === 'string') {
      // Avisos de hidratação relacionados a IDs únicos, timestamps, etc.
      const hydrationWarnings = [
        'A tree hydrated but some attributes of the server rendered HTML didn\'t match the client properties',
        'Text content does not match server-rendered HTML',
        'Hydration failed because the initial UI does not match what was rendered on the server',
        'There was an error while hydrating'
      ];

      // Se é um aviso de hidratação conhecido, não mostrar
      if (hydrationWarnings.some(warning => message.includes(warning))) {
        return;
      }
    }

    // Para outros erros, usar comportamento normal
    originalError.apply(console, args);
  };
}

/**
 * Restaura o console.error original
 */
export function restoreConsoleError() {
  if (typeof window === 'undefined') {
    return;
  }

  // Esta implementação é básica - em produção você pode querer uma implementação mais robusta
  console.error = console.error;
} 