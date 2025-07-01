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
import HydrationDebugger from '@/components/HydrationDebugger';

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

  const defaultFallback = fallback || <SimpleWrapper>{children}</SimpleWrapper>;

  useEffect(() => {
    try {
      // DESABILITADO: Não configurar mais handlers de chunk error
      console.log('⚠️ ClientLayoutWrapper sem handlers automáticos de chunk error');
      
      // Marcar como montado após um pequeno delay
      const timer = setTimeout(() => {
        setMounted(true);
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    } catch (error) {
      console.log('❌ Erro na inicialização do ClientLayoutWrapper:', error);
      setMounted(true);
    }
  }, []);

  // Se não montou ainda, renderizar fallback
  if (!mounted) {
    return <>{defaultFallback}</>;
  }

  // Renderizar apenas o wrapper simples
  return <SimpleWrapper>{children}</SimpleWrapper>;
} 