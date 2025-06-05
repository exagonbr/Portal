'use client';

import { useEffect, useState } from 'react';
import { FaDownload, FaTimes, FaApple, FaAndroid, FaChrome } from 'react-icons/fa';

interface PWAInstallPromptProps {
  registration: ServiceWorkerRegistration | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

export function PWAInstallPrompt({ registration }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isHttps, setIsHttps] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

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

    setPlatform(detectPlatform());

    // Verificar se está usando HTTPS
    const httpsCheck = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    setIsHttps(httpsCheck);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verificar se já foi instalado anteriormente
    const wasInstalled = localStorage.getItem('pwa-installed') === 'true';
    if (wasInstalled) {
      setIsInstalled(true);
      return;
    }

    // Verificar se o usuário já interagiu com o prompt
    const hasInteractedBefore = localStorage.getItem('pwa-prompt-interacted') === 'true';
    setHasInteracted(hasInteractedBefore);

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
        localStorage.setItem('pwa-installed', 'true');
      });
    }

    return () => {
      if (httpsCheck) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, [registration]);

  const handleInstallClick = async () => {
    setHasInteracted(true);
    localStorage.setItem('pwa-prompt-interacted', 'true');

    if (!isHttps) {
      setShowInstructions(true);
      return;
    }

    // Se temos o prompt nativo (Chrome/Edge no Android/Desktop)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installed successfully');
          localStorage.setItem('pwa-installed', 'true');
        }

        setDeferredPrompt(null);
      } catch (error) {
        console.error('Error installing PWA:', error);
        setShowInstructions(true);
      }
    } else {
      // Mostrar instruções manuais para iOS/Safari ou quando não há prompt
      setShowInstructions(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setHasInteracted(true);
    localStorage.setItem('pwa-prompt-interacted', 'true');
  };

  const getInstructions = () => {
    switch (platform) {
      case 'ios':
        return {
          icon: <FaApple className="text-2xl" />,
          title: 'Instalar no iPhone/iPad',
          steps: [
            '1. Toque no botão compartilhar (quadrado com seta)',
            '2. Role para baixo e toque em "Adicionar à Tela de Início"',
            '3. Toque em "Adicionar" no canto superior direito'
          ]
        };
      case 'android':
        return {
          icon: <FaAndroid className="text-2xl text-green-500" />,
          title: 'Instalar no Android',
          steps: [
            '1. Toque no menu (3 pontos) do navegador',
            '2. Selecione "Instalar app" ou "Adicionar à tela inicial"',
            '3. Confirme a instalação'
          ]
        };
      case 'desktop':
        return {
          icon: <FaChrome className="text-2xl text-blue-500" />,
          title: 'Instalar no Computador',
          steps: [
            '1. Clique no ícone de instalação na barra de endereços',
            '2. Ou acesse o menu (3 pontos) > "Instalar..."',
            '3. Confirme a instalação'
          ]
        };
      default:
        return {
          icon: <FaDownload className="text-2xl" />,
          title: 'Instalar App',
          steps: [
            'Use o menu do navegador para instalar este app',
            'Procure por "Instalar" ou "Adicionar à tela inicial"'
          ]
        };
    }
  };

  // Não mostrar se já está instalado ou se o usuário já fechou o prompt
  if (isInstalled || (!isVisible && hasInteracted)) {
    return null;
  }

  const instructions = getInstructions();

  return (
    <>
      {/* Botão principal de instalação */}
      {isVisible && (
        <div className={`fixed z-50 ${
          // Posicionamento responsivo
          platform === 'ios' || platform === 'android' 
            ? 'bottom-20 left-4 right-4' // Mobile: acima da navegação inferior
            : 'bottom-6 right-6' // Desktop: canto inferior direito
        }`}>
          <div className={`
            relative bg-gradient-to-r from-green-500 to-emerald-600 
            text-white rounded-2xl shadow-2xl overflow-hidden
            transform transition-all duration-300 hover:scale-105
            ${platform === 'ios' || platform === 'android' ? 'w-full' : 'max-w-sm'}
          `}>
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
            
            {/* Botão de fechar */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-white/20 transition-colors z-10"
              aria-label="Fechar"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="p-4 pr-10 relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse">
                  <FaDownload className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Instale nosso App!</h3>
                  <p className="text-sm opacity-90">
                    Acesso rápido e offline disponível
                  </p>
                </div>
              </div>

              <button
                onClick={handleInstallClick}
                className="w-full mt-3 px-4 py-3 bg-white text-green-600 font-bold 
                         rounded-xl hover:bg-gray-50 transition-all duration-300 
                         transform hover:scale-[1.02] active:scale-[0.98]
                         shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <FaDownload className="text-lg" />
                  Instalar Agora
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de instruções */}
      {showInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {instructions.icon}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {instructions.title}
                  </h2>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              {!isHttps && (
                <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Instalação de PWA requer HTTPS. Configure um certificado SSL para habilitar a instalação automática.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-green-600">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm pt-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <strong>Dica:</strong> Após instalar, você pode acessar o app diretamente da sua tela inicial, 
                  com funcionalidades offline e notificações push!
                </p>
              </div>

              <button
                onClick={() => setShowInstructions(false)}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold 
                         rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200
                         shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
