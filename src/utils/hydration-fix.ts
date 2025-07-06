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
    return fallback as React.ReactElement;
  }

  return children as React.ReactElement;
}

// Função para suprimir avisos de hidratação
function suppressHydrationWarning() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (args[0]?.includes('Warning: Text content did not match')) return;
    if (args[0]?.includes('Warning: Expected server HTML to contain')) return;
    if (args[0]?.includes('Warning: An error occurred during hydration')) {
      // Em caso de erro de hidratação, tentar recarregar a página
      window.location.reload();
      return;
    }
    originalError.apply(console, args);
  };
}

// Função para configurar prevenção de erros de hidratação
export function setupHydrationErrorPrevention(): void {
  if (typeof window === 'undefined') return;

  // Detectar se é dispositivo móvel
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);

  // Suprimir avisos específicos de hidratação
  suppressHydrationWarning();
  
  // Configurar tratamento de erros de chunk loading
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('Loading chunk') ||
      event.message?.includes('originalFactory is undefined') ||
      event.message?.includes('can\'t access property "call"')
    ) {
      if (isMobile) {
        // Em dispositivos móveis, tentar recarregar imediatamente
        console.warn('📱 Erro de hidratação em dispositivo móvel, recarregando:', event.message);
        window.location.reload();
        return;
      }

      console.warn('Erro de chunk detectado:', event.message);
      // Em outros dispositivos, recarregar após um breve delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  });
  
  // Configurar tratamento de erros de promise rejeitada
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes('Loading chunk') ||
      event.reason?.message?.includes('originalFactory is undefined')
    ) {
      if (isMobile) {
        // Em dispositivos móveis, tentar recarregar imediatamente
        console.warn('📱 Promise rejeitada em dispositivo móvel:', event.reason);
        window.location.reload();
        return;
      }

      console.warn('Promise rejeitada por erro de chunk:', event.reason);
      event.preventDefault();
      // Em outros dispositivos, recarregar após um breve delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  });

  // Adicionar meta tag para forçar recarregamento em caso de erro
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Cache-Control';
  meta.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(meta);
}

// Import React para usar nos hooks
import React from 'react';