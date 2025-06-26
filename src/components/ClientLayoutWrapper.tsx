'use client';

import { useEffect } from 'react';
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
  useEffect(() => {
    setupChunkErrorHandler();
  }, []);

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
} 