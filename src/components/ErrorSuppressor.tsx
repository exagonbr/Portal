'use client';

import { useEffect } from 'react';

export default function ErrorSuppressor() {
  useEffect(() => {
    // Suprimir o erro específico do ResizeObserver que é benigno
    const originalError = console.log;
    console.log = (...args) => {
      // Verificar se é o erro específico do ResizeObserver
      if (
        args.length > 0 &&
        typeof args[0] === 'string' &&
        // Non-Error promise rejection was suppressed here.
        // It is better to let these errors surface so that the root cause
        // (an unhandled promise rejection) can be found and fixed.
        (args[0].includes('ResizeObserver loop completed with undelivered notifications') ||
         args[0].includes('ResizeObserver loop limit exceeded') ||
         args[0].includes('Script error'))
      ) {
        // Ignorar este erro específico - é um problema conhecido e benigno
        return;
      }
      
      // Detectar erros de React Hooks - apenas registrar para diagnóstico,
      // mas não suprimir completamente
      const hasReactHookError = reactHookErrors.some(pattern => 
        message.includes(pattern)
      );
      
      if (hasReactHookError) {
        // Registrar o erro, mas não suprimir completamente
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [ErrorSuppressor] ⚠️ Detectado erro de React Hook: ${message}`);
        // Poderia salvar em armazenamento local para diagnóstico futuro
        try {
          const hookErrors = JSON.parse(localStorage.getItem('reactHookErrors') || '[]');
          hookErrors.push({ timestamp, message });
          localStorage.setItem('reactHookErrors', JSON.stringify(hookErrors.slice(-20))); // Manter apenas os 20 mais recentes
        } catch (e) {
          // Silenciosamente ignorar erros de localStorage
        }
        
        // Mesmo que seja um erro importante, permitimos que seja registrado
        // mas não queremos que interrompa a aplicação
        return true;
      }
      
      // Detectar erros de refresh token que NÃO devem ser suprimidos
      const hasTokenError = tokenErrorsToLog.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (hasTokenError) {
        // Log especial para erros de token, mas não suprimir
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] [ErrorSuppressor] ❌ Erro durante o login: ${message}`);
        return false; // Não suprimir erros de token
      }
      
      // Se contém padrões importantes, NÃO suprimir
      const hasImportantPattern = importantPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (hasImportantPattern && !hasReactHookError) {
        return false; // NÃO suprimir logs importantes (exceto hooks errors que já tratamos acima)
      }
      
      // Se contém padrões do ResizeObserver, suprimir
      const isResizeObserverError = resizeObserverErrorPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (isResizeObserverError) return true;

      // Se contém padrões de erro de autenticação, suprimir
      const isAuthError = authErrorsToSuppress.some(pattern => 
        message.includes(pattern)
      );

      return isAuthError;
    };

    // Função para verificar se qualquer argumento contém padrões importantes
    const hasImportantArgs = (args: any[]): boolean => {
      return args.some(arg => {
        try {
          // Converte o argumento para string de forma segura
          const argString = arg instanceof Error 
            ? `${arg.message}\n${arg.stack || ''}`
            : String(arg || '');

          // Verifica se contém algum padrão importante
          return importantPatterns.some(pattern => 
            argString.toLowerCase().includes(pattern.toLowerCase())
          );
        } catch (error) {
          // Em caso de erro na conversão, considera como não importante
          return false;
        }
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
        // Verificar especificamente por erros de React Hooks
        const firstArgString = String(args[0] || '');
        const isReactHookError = reactHookErrors.some(pattern => 
          firstArgString.includes(pattern)
        );

        // Se for erro de hooks, registrar mas continuar a execução
        if (isReactHookError) {
          const timestamp = new Date().toISOString();
          originalError(`[${timestamp}] [ErrorSuppressor] Erro de React Hook detectado:`);
          originalError(...args);
          isProcessingError = false;
          return;
        }
        
        // Se tem argumentos importantes, sempre mostrar
        if (hasImportantArgs(args)) {
          // Adiciona timestamp e contexto ao log
          const timestamp = new Date().toISOString();
          const context = 'ErrorSuppressor';
          originalError(`[${timestamp}] [${context}]`, ...args);
          isProcessingError = false;
          return;
        }

        const firstArg = args[0];
        
        if (shouldSuppressError(String(firstArg))) {
          // Ignorar completamente este erro
          isProcessingError = false;
          return;
        }

        // Verificar se algum dos argumentos contém mensagem relacionada
        const shouldSuppress = args.some(arg => 
          shouldSuppressError(String(arg))
        );

        if (shouldSuppress) {
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
      if (
        event.message &&
        (event.message.includes('ResizeObserver loop completed with undelivered notifications') ||
         event.message.includes('ResizeObserver loop limit exceeded') ||
         event.message.includes('Script error'))
      ) {
        // Prevenir que o erro apareça no console
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
      console.log = originalError;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
} 