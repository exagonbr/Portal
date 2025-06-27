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
  fallback?: React.ReactNode;
}

// Componente de fallback simples
function SimpleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      {children}
    </div>
  );
}

export default function ClientLayoutWrapper({ children, fallback }: ClientLayoutWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const defaultFallback = fallback || <SimpleWrapper>{children}</SimpleWrapper>;

  useEffect(() => {
    try {
      // Configurar handler de chunk errors de forma mais simples
      const handleChunkError = (event: ErrorEvent) => {
        if (event.error?.message?.includes('originalFactory') || 
            event.error?.message?.includes('ChunkLoadError')) {
          console.warn('🔄 Erro de chunk detectado no ClientLayoutWrapper')
          setHasError(true)
          event.preventDefault()
        }
      }

      window.addEventListener('error', handleChunkError)
      
      // Marcar como montado após um pequeno delay
      const timer = setTimeout(() => {
        setMounted(true);
      }, 100);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('error', handleChunkError)
      };
    } catch (error) {
      console.error('❌ Erro na inicialização do ClientLayoutWrapper:', error);
      setHasError(true);
      setMounted(true);
    }
  }, []);

  // Se não montou ainda ou houve erro, renderizar fallback
  if (!mounted || hasError) {
    return <>{defaultFallback}</>;
  }

  // Por enquanto, renderizar apenas o wrapper simples
  return <SimpleWrapper>{children}</SimpleWrapper>;
} 