'use client';

import { isDevelopment } from './env';

/**
 * Utilitários para resolver problemas de hidratação
 */

// Função para detectar se estamos no cliente
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Função para detectar se estamos no servidor
export function isServer(): boolean {
  return typeof window === 'undefined';
}

// Hook para aguardar hidratação
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = React.useState(false);
  
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return isHydrated;
}

// Componente que só renderiza no cliente
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Função para suprimir avisos de hidratação em desenvolvimento
export function suppressHydrationWarning(): void {
  if (isDevelopment() && isClient()) {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Hydration failed') ||
         args[0].includes('There was an error while hydrating') ||
         args[0].includes('Text content does not match') ||
         args[0].includes('can\'t access property "call", originalFactory is undefined'))
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  }
}

// Função para configurar prevenção de erros de hidratação
export function setupHydrationErrorPrevention(): void {
  if (isClient()) {
    // Suprimir avisos específicos de hidratação
    suppressHydrationWarning();
    
    // Configurar tratamento de erros de chunk loading
    window.addEventListener('error', (event) => {
      if (
        event.message?.includes('Loading chunk') ||
        event.message?.includes('originalFactory is undefined') ||
        event.message?.includes('can\'t access property "call"')
      ) {
        if (isDevelopment()) {
          console.warn('Erro de chunk detectado, recarregando página:', event.message);
        }
        // Recarregar a página para resolver problemas de chunk
        window.location.reload();
      }
    });
    
    // Configurar tratamento de erros de promise rejeitada
    window.addEventListener('unhandledrejection', (event) => {
      if (
        event.reason?.message?.includes('Loading chunk') ||
        event.reason?.message?.includes('originalFactory is undefined')
      ) {
        if (isDevelopment()) {
          console.warn('Promise rejeitada por erro de chunk:', event.reason);
        }
        event.preventDefault();
        window.location.reload();
      }
    });
  }
}

// Import React para usar nos hooks
import React from 'react';