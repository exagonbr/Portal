'use client';

import { useEffect, useState } from 'react';

interface HydrationSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper que previne problemas de hidratação causados por extensões do navegador
 * ou diferenças entre servidor e cliente
 */
export default function HydrationSafeWrapper({ 
  children, 
  fallback = null 
}: HydrationSafeWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Aguardar próximo tick para garantir que o DOM está estável
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Durante SSR e primeiro render no cliente, mostrar fallback ou nada
  if (!mounted) {
    return <div suppressHydrationWarning>{fallback}</div>;
  }

  // Após hidratação, mostrar conteúdo real
  return <>{children}</>;
}

/**
 * Hook para verificar se o componente foi hidratado
 */
export function useIsHydrated() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Componente que só renderiza no cliente (após hidratação)
 */
export function ClientOnly({ children, fallback = null }: HydrationSafeWrapperProps) {
  const isHydrated = useIsHydrated();
  
  if (!isHydrated) {
    return <div suppressHydrationWarning>{fallback}</div>;
  }

  return <>{children}</>;
} 