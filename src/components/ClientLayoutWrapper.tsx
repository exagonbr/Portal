'use client';

import { useEffect, useState } from 'react';
import { PWAUpdateManager, UpdateProvider } from '@/components/PWAUpdateManager';
import { PushNotificationInitializer } from '@/components/PushNotificationInitializer';
import ErrorSuppressor from '@/components/ErrorSuppressor';
import GlobalSetup from '@/components/GlobalSetup';
import Handtalk from '@/components/Handtalk';
import ClientOnly from '@/components/ClientOnly';
import { LoopEmergencyReset } from '@/components/LoopEmergencyReset';
import { FirefoxCompatibilityInitializer } from '@/components/FirefoxCompatibilityInitializer';
import ChunkErrorHandler from '@/components/ChunkErrorHandler';
import HydrationDebugger from '@/components/HydrationDebugger';
import { setupChunkErrorHandler } from '@/utils/chunk-retry';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // Configurar handler de chunk errors primeiro
      setupChunkErrorHandler();
      
      // Aguardar um pouco para garantir que tudo está inicializado
      const timer = setTimeout(() => {
        setMounted(true);
      }, 50);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('❌ Erro na inicialização do ClientLayoutWrapper:', error);
      setHasError(true);
      // Mesmo com erro, marcar como montado para renderizar o conteúdo
      setMounted(true);
    }
  }, []);

  // Se não montou ainda, renderizar apenas o children
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-full">
        {children}
      </div>
    );
  }

  // Se houve erro, renderizar versão simplificada
  if (hasError) {
    console.warn('⚠️ ClientLayoutWrapper em modo de fallback devido a erro');
    return (
      <div className="flex flex-col min-h-full">
        {children}
      </div>
    );
  }

  try {
    return (
      <>
        <ClientOnly>
          <ErrorSuppressor />
          <GlobalSetup />
        </ClientOnly>
        
        <UpdateProvider>
          <ClientOnly>
            <Handtalk token="fe964e92fd91396436b25c2ee95b3976" />
          </ClientOnly>

          <div className="flex flex-col min-h-full">
            {children}
          </div>
          
          <ClientOnly>
            <PWAUpdateManager />
            <PushNotificationInitializer />
            <LoopEmergencyReset />
            <FirefoxCompatibilityInitializer />
            <ChunkErrorHandler />
          </ClientOnly>
        </UpdateProvider>
        
        <HydrationDebugger />
      </>
    );
  } catch (error) {
    console.error('❌ Erro ao renderizar ClientLayoutWrapper:', error);
    // Fallback para versão simplificada
    return (
      <div className="flex flex-col min-h-full">
        {children}
      </div>
    );
  }
} 