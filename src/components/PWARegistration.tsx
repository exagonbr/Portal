'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { IOSInstallBanner } from './IOSInstallBanner';
import { OfflineIndicator } from './OfflineIndicator';
import { startPWALoopMonitoring, isPWALoopActive, emergencyPWAFix } from '@/utils/pwa-fix';
import { setupRequestLoopDetection, setupLoginLoopProtection } from '@/utils/request-loop-detector';

export function PWARegistration() {
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [workbox, setWorkbox] = useState<Workbox | null>(null);
  const [loopDetected, setLoopDetected] = useState(false);
  const [swRedundant, setSwRedundant] = useState(false);

  useEffect(() => {
    const registerSW = async () => {
      // 1. Configurar proteções contra loops ANTES de qualquer coisa
      setupRequestLoopDetection();
      setupLoginLoopProtection();
      startPWALoopMonitoring();

      // 2. Verificar se há loop ativo antes de prosseguir
      if (isPWALoopActive()) {
        console.warn('🚨 Loop PWA detectado, executando correção de emergência...');
        setLoopDetected(true);
        await emergencyPWAFix();
        return;
      }

      // 3. Registrar Service Worker com proteções
      if ('serviceWorker' in navigator) {
        const wb = new Workbox('/sw.js');

        // Add event listeners for service worker updates
        wb.addEventListener('installed', (event) => {
          if (event.isUpdate) {
            setIsUpdateAvailable(true);
          }
        });

        wb.addEventListener('waiting', () => {
          setIsUpdateAvailable(true);
        });

        // Adicionar listener para detectar problemas
        wb.addEventListener('redundant', () => {
          setSwRedundant(true);
          
          // Verificar se há um novo service worker disponível
          if (navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true);
          } else {
            console.warn('🚨 Service Worker redundante sem substituto, pode ser necessário recarregar');
          }
        });

        // Register the service worker com timeout
        const registrationPromise = wb.register();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Service Worker registration timeout')), 10000);
        });

        const reg = await Promise.race([registrationPromise, timeoutPromise]) as ServiceWorkerRegistration;
        
        if (reg) {
          setRegistration(reg);
          setWorkbox(wb);
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
