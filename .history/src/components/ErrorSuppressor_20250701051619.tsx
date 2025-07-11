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
      // Para todos os outros erros, usar o comportamento normal
      originalError.apply(console, args);
    };

    // Também capturar erros não tratados do ResizeObserver
    const handleError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes('ResizeObserver loop completed with undelivered notifications') ||
         event.message.includes('ResizeObserver loop limit exceeded') ||
         event.message.includes('Script error'))
      ) {
        // Prevenir que o erro apareça no console
        event.preventDefault();
        return false;
      }
    };

    // Capturar erros de promise rejeitadas não tratadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason &&
        typeof reason === 'object' &&
        reason.message &&
        (reason.message.includes('ResizeObserver loop completed with undelivered notifications') ||
         reason.message.includes('ResizeObserver loop limit exceeded'))
      ) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      console.log = originalError;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
} 