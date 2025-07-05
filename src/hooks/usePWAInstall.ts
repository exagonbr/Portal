import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

interface PWAInstallState {
  isInstalled: boolean;
  isInstallable: boolean;
  platform: Platform;
  deferredPrompt: BeforeInstallPromptEvent | null;
  isHttps: boolean;
}

export function usePWAInstall() {
  const [state, setState] = useState<PWAInstallState>({
    isInstalled: false,
    isInstallable: false,
    platform: 'unknown',
    deferredPrompt: null,
    isHttps: true,
  });

  useEffect(() => {
    // Detectar plataforma
    const detectPlatform = (): Platform => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // iOS detection
      if (/iphone|ipad|ipod/.test(userAgent) || 
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return 'ios';
      }
      
      // Android detection
      if (/android/.test(userAgent)) {
        return 'android';
      }
      
      // Desktop
      if (!/mobile|tablet/.test(userAgent)) {
        return 'desktop';
      }
      
      return 'unknown';
    };

    // Verificar se está usando HTTPS
    const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

    // Verificar se já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.matchMedia('(display-mode: fullscreen)').matches ||
                          window.matchMedia('(display-mode: minimal-ui)').matches ||
                          (window.navigator as any).standalone === true;
      
      const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
      
      return isStandalone || wasInstalled;
    };

    // Atualizar estado inicial
    setState(prev => ({
      ...prev,
      platform: detectPlatform(),
      isHttps,
      isInstalled: checkInstalled(),
    }));

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      
      setState(prev => ({
        ...prev,
        deferredPrompt: promptEvent,
        isInstallable: true,
      }));
    };

    // Listener para appinstalled
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        deferredPrompt: null,
      }));
    };

    if (isHttps) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      if (isHttps) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, []);

  const install = async (): Promise<boolean> => {
    if (!state.deferredPrompt) {
      return false;
    }

    try {
      await state.deferredPrompt.prompt();
      const choiceResult = await state.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error installing PWA:', error);
      return false;
    }
  };

  return {
    ...state,
    install,
    canInstall: state.isInstallable && !state.isInstalled && state.isHttps,
  };
} 