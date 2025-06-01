'use client';

import { useEffect } from 'react';

export default function ErrorSuppressor() {
  useEffect(() => {
    // Lista de padrões de erro relacionados ao ResizeObserver para suprimir
    const resizeObserverErrorPatterns = [
      'ResizeObserver loop completed with undelivered notifications',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop',
      'Script error',
      'Non-Error promise rejection captured',
      'ResizeObserver callback timeout',
      'Unable to process ResizeObserver loop',
      'ResizeObserver: callback timeout exceeded',
      // Variações em inglês e português
      'Erro do ResizeObserver',
      'ResizeObserver erro',
      'Observer loop error',
      'Observation loop error'
    ];

    // Lista de padrões que NÃO devem ser suprimidos (logs importantes)
    const importantPatterns = [
      'auth',
      'login',
      'dashboard',
      'redirect',
      'role',
      'permission',
      'user',
      'session',
      'navigation',
      'router',
      '🔐', '🚀', '✅', '❌', '🔍', '🔄', // Emojis dos logs importantes
      'API'
    ];

    // Função para verificar se o erro deve ser suprimido
    const shouldSuppressError = (message: string): boolean => {
      if (!message || typeof message !== 'string') return false;
      
      // Se contém padrões importantes, NÃO suprimir
      const hasImportantPattern = importantPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (hasImportantPattern) {
        return false; // NÃO suprimir logs importantes
      }
      
      // Se contém padrões do ResizeObserver, suprimir
      return resizeObserverErrorPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
    };

    // Função para verificar se qualquer argumento contém padrões importantes
    const hasImportantArgs = (args: any[]): boolean => {
      return args.some(arg => {
        const argString = String(arg);
        return importantPatterns.some(pattern => 
          argString.toLowerCase().includes(pattern.toLowerCase())
        );
      });
    };

    // Flags para prevenir recursão
    let isProcessingError = false;
    let isProcessingWarn = false;

    // Sobrescrever console.error
    const originalError = console.error;
    console.error = (...args) => {
      // Prevenir recursão
      if (isProcessingError) {
        return originalError(...args);
      }

      isProcessingError = true;

      try {
        // Se tem argumentos importantes, sempre mostrar
        if (hasImportantArgs(args)) {
          originalError(...args);
          isProcessingError = false;
          return;
        }

        // Verificar se é um erro do ResizeObserver
        const firstArg = args[0];
        
        if (shouldSuppressError(String(firstArg))) {
          // Ignorar completamente este erro
          isProcessingError = false;
          return;
        }

        // Verificar se algum dos argumentos contém mensagem relacionada
        const hasResizeObserverError = args.some(arg => 
          shouldSuppressError(String(arg))
        );

        if (hasResizeObserverError) {
          isProcessingError = false;
          return;
        }

        // Para todos os outros erros, usar o comportamento normal
        originalError(...args);
      } catch (error) {
        // Em caso de erro durante o processamento, usar método original diretamente
        originalError(...args);
      } finally {
        isProcessingError = false;
      }
    };

    // Sobrescrever console.warn para casos onde o erro aparece como warning
    const originalWarn = console.warn;
    console.warn = (...args) => {
      // Prevenir recursão
      if (isProcessingWarn) {
        return originalWarn(...args);
      }

      isProcessingWarn = true;

      try {
        // Se tem argumentos importantes, sempre mostrar
        if (hasImportantArgs(args)) {
          originalWarn(...args);
          isProcessingWarn = false;
          return;
        }

        const firstArg = args[0];
        
        if (shouldSuppressError(String(firstArg))) {
          isProcessingWarn = false;
          return;
        }

        originalWarn(...args);
      } catch (error) {
        originalWarn(...args);
      } finally {
        isProcessingWarn = false;
      }
    };

    // Capturar erros globais não tratados
    const handleError = (event: ErrorEvent) => {
      if (event.message && shouldSuppressError(event.message)) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Capturar erros de promise rejeitadas não tratadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      if (reason) {
        let reasonMessage = '';
        
        // Extrair mensagem do erro de diferentes formas
        if (typeof reason === 'string') {
          reasonMessage = reason;
        } else if (reason.message) {
          reasonMessage = reason.message;
        } else if (reason.toString) {
          reasonMessage = reason.toString();
        }

        if (shouldSuppressError(reasonMessage)) {
          event.preventDefault();
          return false;
        }
      }
    };

    // Event listeners
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
    };
  }, []);

  return null;
} 