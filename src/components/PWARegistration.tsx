'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { OfflineIndicator } from './OfflineIndicator';

export function PWARegistration() {
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [workbox, setWorkbox] = useState<Workbox | null>(null);

  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
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

          // Register the service worker
          const reg = await wb.register();
          if (reg) {
            setRegistration(reg);
            setWorkbox(wb);
          }
        } catch (error) {
          console.error('Service worker registration failed:', error);
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
      <OfflineIndicator isOnline={isOnline} />

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
