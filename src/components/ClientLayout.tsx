'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import SimpleProviders from '@/providers/SimpleProviders';
import CacheManagerWrapper from '@/components/CacheManagerWrapper';
import { ChunkErrorHandler } from '@/components/ChunkErrorHandler';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // Suprimir avisos de hidratação em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      try {
        // Implementação inline para evitar problemas de importação
        const originalError = console.error;
        console.error = (...args: any[]) => {
          if (
            typeof args[0] === 'string' &&
            (args[0].includes('Hydration') || 
             args[0].includes('hydration') ||
             args[0].includes('Text content does not match') ||
             args[0].includes('Prop `') ||
             args[0].includes('Warning: '))
          ) {
            return;
          }
          originalError.apply(console, args);
        };
      } catch (error) {
        // Ignorar erros na configuração
      }
    }
  }, []);

  return (
    <>
      <ChunkErrorHandler />
      <SimpleProviders>
        <div className="flex flex-col min-h-screen w-full">
          {children}
        </div>
        <CacheManagerWrapper />
      </SimpleProviders>
      <Script src="/register-sw.js" strategy="lazyOnload" />
    </>
  );
} 