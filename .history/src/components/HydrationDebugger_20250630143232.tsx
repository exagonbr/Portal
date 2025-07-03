'use client';

import { useEffect, useState } from 'react';
import { isDevelopment } from '@/utils/env';

/**
 * Componente para debug de problemas de hidratação
 * Só deve ser usado em desenvolvimento
 */
export default function HydrationDebugger() {
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Só executar em desenvolvimento
    if (!isDevelopment()) {
      return;
    }

    // Capturar erros de hidratação
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string') {
        // Detectar erros de hidratação comuns
        if (
          message.includes('hydrating') ||
          message.includes('Hydration') ||
          message.includes('client and server') ||
          message.includes('did not match')
        ) {
          setHydrationError(message);
          console.warn('🚨 ERRO DE HIDRATAÇÃO DETECTADO:', message);
          console.warn('🔍 Verifique se há diferenças entre servidor e cliente');
          console.warn('💡 Considere usar ClientOnly ou useEffect para código específico do cliente');
        }
      }
      originalError.apply(console, args);
    };

    // Capturar erros não tratados
    const handleError = (event: ErrorEvent) => {
      if (event.message && (
        event.message.includes('hydrating') ||
        event.message.includes('Hydration') ||
        event.message.includes('client and server')
      )) {
        setHydrationError(event.message);
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      console.error = originalError;
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Não renderizar nada em produção
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Não renderizar até estar montado
  if (!mounted) {
    return null;
  }

  // Mostrar alerta se houver erro de hidratação
  if (hydrationError) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium">🚨 Erro de Hidratação Detectado</h3>
              <p className="mt-1 text-sm opacity-90">
                Há diferenças entre o que foi renderizado no servidor e no cliente.
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm underline">
                  Ver detalhes do erro
                </summary>
                <pre className="mt-2 text-xs bg-red-700 p-2 rounded overflow-auto max-h-32">
                  {hydrationError}
                </pre>
              </details>
              <div className="mt-3">
                <button
                  onClick={() => setHydrationError(null)}
                  className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 