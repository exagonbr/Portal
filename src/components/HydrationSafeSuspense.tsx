'use client';

import { Suspense, ReactNode } from 'react';
import ClientOnly from './ClientOnly';

interface HydrationSafeSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente Suspense que é seguro para hidratação,
 * garantindo que o conteúdo seja renderizado apenas no cliente
 */
export default function HydrationSafeSuspense({ 
  children, 
  fallback 
}: HydrationSafeSuspenseProps) {
  const defaultFallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );

  return (
    <ClientOnly fallback={fallback || defaultFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ClientOnly>
  );
} 