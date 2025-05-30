'use client';

import { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';

interface PWAInstallPromptProps {
  registration: ServiceWorkerRegistration | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// The 'beforeinstallprompt' event is already declared globally in your types, so no need to redeclare it here.

export function PWAInstallPrompt({ registration }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for successful installation
    window.addEventListener('appinstalled', (e) => {
      e.preventDefault();
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [registration]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Se não há prompt nativo, tentar abrir instruções manuais ou reload
      alert('Para instalar este app:\n\n• No Chrome: Menu > Instalar app\n• No Firefox: Menu > Instalar\n• No Safari: Compartilhar > Adicionar à Tela Inicial');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installed successfully');
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  // Só oculta se estiver instalado
  if (isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-8 z-50">
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-4 py-3 bg-primary-DEFAULT text-white rounded-lg shadow-lg hover:bg-primary-dark transition-colors duration-200"
        aria-label="Install PWA"
      >
        <FaDownload className="text-lg" />
        <span className="font-medium">Instalar App</span>
      </button>
    </div>
  );
}
