'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { IOSInstallBanner } from './IOSInstallBanner';
import { OfflineIndicator } from './OfflineIndicator';
import { startPWALoopMonitoring, isPWALoopActive, emergencyPWAFix } from '@/utils/pwa-fix';

export function PWARegistration() {
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [workbox, setWorkbox] = useState<Workbox | null>(null);
  const [loopDetected, setLoopDetected] = useState(false);

  useEffect(() => {
    const registerSW = async () => {
      // Iniciar monitoramento de loops ANTES de registrar o service worker
      try {
        startPWALoopMonitoring();
        console.log('🔍 PWA Loop Monitoring iniciado');
      } catch (error) {
        console.warn('⚠️ Não foi possível iniciar monitoramento de loops:', error);
      }

      // Verificar se há loop ativo antes de prosseguir
      if (isPWALoopActive()) {
        console.warn('🚨 Loop PWA detectado, executando correção de emergência...');
        setLoopDetected(true);
        await emergencyPWAFix();
        return;
      }

      if ('serviceWorker' in navigator) {
        try {
          const wb = new Workbox('/sw.js');

          // Add event listeners for service worker updates
          wb.addEventListener('installed', (event) => {
            console.log('📦 Service Worker instalado:', event.isUpdate ? 'Atualização' : 'Primeira instalação');
            if (event.isUpdate) {
              setIsUpdateAvailable(true);
            }
          });

          wb.addEventListener('waiting', () => {
            console.log('⏳ Service Worker aguardando ativação');
            setIsUpdateAvailable(true);
          });

          // Adicionar listener para detectar problemas
          wb.addEventListener('redundant', () => {
            console.warn('⚠️ Service Worker tornou-se redundante');
          });

          // Register the service worker com timeout
          const registrationPromise = wb.register();
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Service Worker registration timeout')), 10000);
          });

          const reg = await Promise.race([registrationPromise, timeoutPromise]) as ServiceWorkerRegistration;
          
          if (reg) {
            console.log('✅ Service Worker registrado com sucesso');
            setRegistration(reg);
            setWorkbox(wb);
          }
        } catch (error) {
          console.error('❌ Service worker registration failed:', error);
          
          // Se falhar, tentar correção de emergência
          if (error instanceof Error && error.message.includes('timeout')) {
            console.warn('🚨 Timeout no registro do Service Worker, aplicando correção...');
            await emergencyPWAFix();
          }
        }
      }
    };

    registerSW();

    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = async () => {
    if (!workbox) return;

    try {
      await workbox.messageSkipWaiting();
      window.location.reload();
    } catch (error) {
      console.error('Failed to update service worker:', error);
    }
  };

  return (
    <>
      <IOSInstallBanner />
      <OfflineIndicator isOnline={isOnline} />

      {loopDetected && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-red-500 text-white rounded-lg shadow-lg border border-red-600 max-w-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <p className="text-sm font-medium">
              Loop PWA detectado - Aplicando correção...
            </p>
          </div>
          <p className="text-xs mt-1 opacity-90">
            A página será recarregada automaticamente
          </p>
        </div>
      )}

      {isUpdateAvailable && (
        <div className="fixed bottom-20 right-4 z-50 p-4 bg-background-primary rounded-lg shadow-lg border border-border-DEFAULT">
          <p className="text-sm text-text-primary mb-2">
            Nova versão disponível!
          </p>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-primary-DEFAULT text-white rounded-md text-sm hover:bg-primary-dark transition-colors duration-200"
          >
            Atualizar
          </button>
        </div>
      )}

      <PWAInstallPrompt registration={registration} />
    </>
  );
}
