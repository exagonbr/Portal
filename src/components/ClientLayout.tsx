'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import SimpleProviders from '@/providers/SimpleProviders';
import CacheManagerWrapper from '@/components/CacheManagerWrapper';
import { ChunkErrorHandler } from '@/components/ChunkErrorHandler';
import { suppressHydrationWarnings } from '@/utils/suppressHydrationWarnings';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // Suprimir avisos de hidratação em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      try {
        suppressHydrationWarnings();
      } catch (error) {
        // Ignorar erros na configuração
        console.warn('Erro ao configurar supressão de avisos de hidratação:', error);
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