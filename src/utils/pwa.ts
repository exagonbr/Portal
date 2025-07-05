export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches;
}

export function isInstallPromptSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'BeforeInstallPromptEvent' in window;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    return registration;
  } catch (error) {
    console.log('Service worker registration failed:', error);
    return null;
  }
}

export function checkConnectivity(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

export async function clearServiceWorkerCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
  } catch (error) {
    console.log('Failed to clear cache:', error);
  }
}

export async function updateServiceWorker(registration: ServiceWorkerRegistration): Promise<void> {
  if (!registration.waiting) return;

  // Send message to waiting service worker to activate it
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });

  // Reload once the new service worker takes over
  registration.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

export function setupConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export async function promptInstall(deferredPrompt: BeforeInstallPromptEvent): Promise<boolean> {
  if (!deferredPrompt) return false;

  try {
    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    return choiceResult.outcome === 'accepted';
  } catch (error) {
    console.log('Error installing PWA:', error);
    return false;
  }
}
