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
import { SimpleWrapper } from './SimpleWrapper';
import { useCacheProblems } from './CacheCleaner';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientLayoutWrapper({ children, fallback }: ClientLayoutWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const { cleanCache, isCleaningCache } = useCacheProblems();
  const isMobile = typeof window !== 'undefined' && /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);

  const defaultFallback = fallback || <SimpleWrapper>{children}</SimpleWrapper>;

  useEffect(() => {
    try {
      // Em dispositivos móveis, sempre limpar o cache ao montar
      if (isMobile) {
        const lastCleanTime = parseInt(sessionStorage.getItem('last-cache-clean') || '0');
        const now = Date.now();
        
        // Limpar cache se a última limpeza foi há mais de 5 segundos
        // Isso evita múltiplas limpezas durante redirecionamentos rápidos
        if (now - lastCleanTime > 5000) {
          sessionStorage.setItem('last-cache-clean', now.toString());
          cleanCache();
          return;
        }
      }

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
  }, [isMobile, cleanCache]);

  // Se está limpando cache, mostrar mensagem
  if (isCleaningCache) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100 p-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mb-6 animate-spin"></div>
        <h2 className="text-xl font-medium mb-2 text-center text-gray-800">
          Otimizando...
        </h2>
        <p className="text-sm text-center text-gray-600">
          Aguarde enquanto preparamos sua experiência
        </p>
      </div>
    );
  }

  // Se não montou ainda, renderizar fallback
  if (!mounted) {
    return <>{defaultFallback}</>;
  }

  // Renderizar apenas o wrapper simples
  return (
    <SimpleWrapper>
      <Handtalk token="fe964e92fd91396436b25c2ee95b3976" />
      {children}
    </SimpleWrapper>
  );
} 