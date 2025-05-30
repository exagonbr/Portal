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
  const [isHttps, setIsHttps] = useState(true);

  useEffect(() => {
    // Verificar se está usando HTTPS
    const httpsCheck = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setIsHttps(httpsCheck);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event (só funciona em HTTPS)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    if (httpsCheck) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // Listen for successful installation
      window.addEventListener('appinstalled', (e) => {
        e.preventDefault();
        setIsInstalled(true);
        setDeferredPrompt(null);
      });
    }

    return () => {
      if (httpsCheck) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, [registration]);

  const handleInstallClick = async () => {
    if (!isHttps) {
      alert('⚠️ Instalação de PWA requer HTTPS\n\nPara instalar como aplicativo:\n\n🔒 Configure um certificado SSL gratuito com Let\'s Encrypt\n\n📱 Ou use as instruções do navegador:\n• Chrome: Menu > Instalar app\n• Firefox: Menu > Instalar\n• Safari: Compartilhar > Adicionar à Tela Inicial');
      return;
    }

    if (!deferredPrompt) {
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
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-colors duration-200 ${
          isHttps 
            ? 'bg-primary-DEFAULT text-white hover:bg-primary-dark' 
            : 'bg-yellow-600 text-white hover:bg-yellow-700'
        }`}
        aria-label="Install PWA"
      >
        <FaDownload className="text-lg" />
        <span className="font-medium">
          {isHttps ? 'Instalar App' : 'Instalar App'}
        </span>
      </button>
    </div>
  );
}
