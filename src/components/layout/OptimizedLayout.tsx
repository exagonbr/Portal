'use client';

import { ReactNode, Suspense } from 'react';
import { isDevelopment } from '@/utils/env';

interface OptimizedLayoutProps {
  children: ReactNode;
  className?: string;
}

// Componente de loading simples
function SimpleLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Layout otimizado que evita problemas de hidratação
export function OptimizedLayout({ children, className = '' }: OptimizedLayoutProps) {
  return (
    <div className={`min-h-screen ${className}`}>
      <Suspense fallback={<SimpleLoading />}>
        {children}
      </Suspense>
      
      {/* Debug components apenas em desenvolvimento */}
      {isDevelopment() && (
        <Suspense fallback={null}>
          <div id="debug-components" />
        </Suspense>
      )}
    </div>
  );
}

export default OptimizedLayout;