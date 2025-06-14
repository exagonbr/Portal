'use client';

import { useEffect, useState, useRef } from 'react';
import { FaDownload, FaTimes, FaApple, FaAndroid, FaChrome, FaEyeSlash } from 'react-icons/fa';

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
  const [timeLeft, setTimeLeft] = useState(30); // 30 segundos
  const [showTimer, setShowTimer] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Verificar se o usuário escolheu "Não exibir novamente"
    const neverShowAgain = localStorage.getItem('pwa-prompt-never-show') === 'true';
    if (neverShowAgain) {
      setIsVisible(false);
      setHasInteracted(true);
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
        localStorage.setItem('pwa-installed', 'true');
      });
    }

    return () => {
      if (httpsCheck) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, [registration]);

  // Timer para fechar automaticamente após 30 segundos
  useEffect(() => {
    // Limpar timer anterior se existir
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Só inicia o timer se o modal estiver visível e o usuário não tiver interagido
    if (!isVisible || hasInteracted || isInstalled) {
      setTimeLeft(0);
      return;
    }

    // Resetar o timer quando o modal se torna visível
    setTimeLeft(30);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Tempo esgotado, fechar automaticamente
          setIsVisible(false);
          setHasInteracted(true);
          localStorage.setItem('pwa-prompt-interacted', 'true');
          
          // Limpar o timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isVisible, hasInteracted, isInstalled]);

  const handleInstallClick = async () => {
    // Limpar timer quando usuário interage
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setHasInteracted(true);
    setTimeLeft(0);
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
    // Limpar timer quando usuário fecha
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsVisible(false);
    setHasInteracted(true);
    setTimeLeft(0);
    localStorage.setItem('pwa-prompt-interacted', 'true');
  };

  const handleNeverShowAgain = () => {
    // Limpar timer quando usuário escolhe não exibir novamente
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsVisible(false);
    setHasInteracted(true);
    setTimeLeft(0);
    localStorage.setItem('pwa-prompt-interacted', 'true');
    localStorage.setItem('pwa-prompt-never-show', 'true');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            relative bg-gradient-to-r from-green-500 via-emerald-600 to-green-500 
            text-white rounded-2xl shadow-2xl overflow-hidden
            transform transition-all duration-300 hover:scale-105
            border border-white/20 backdrop-blur-sm
            ${platform === 'ios' || platform === 'android' ? 'w-full' : 'max-w-sm'}
          `}>
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />
            
            {/* Efeito de onda na parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
              <div className="absolute inset-0 bg-white rounded-t-full translate-y-6 animate-wave-slow"></div>
              <div className="absolute inset-0 bg-white rounded-t-full translate-y-6 translate-x-8 animate-wave-fast"></div>
            </div>
            
            {/* Timer no canto superior esquerdo */}
            {showTimer && timeLeft > 0 && (
              <div className="absolute top-2 left-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-mono z-10">
                {formatTime(timeLeft)}
              </div>
            )}
            
            {/* Botão de fechar */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-white/20 transition-colors z-10"
              aria-label="Fechar"
            >
              <FaTimes className="text-sm" />
            </button>

            <div className="p-5 pr-10 relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <FaDownload className="text-2xl relative z-10" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Instale nosso App!</h3>
                  <p className="text-sm opacity-90 text-white">
                    Acesso rápido e offline disponível
                  </p>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="space-y-2">
                <button
                  onClick={handleInstallClick}
                  className="w-full px-4 py-3 bg-white text-green-600 font-bold 
                           rounded-xl hover:bg-gray-50 transition-all duration-300 
                           transform hover:scale-[1.02] active:scale-[0.98]
                           shadow-lg hover:shadow-xl relative overflow-hidden group"
                >
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-green-100 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <FaDownload className="text-lg" />
                    Instalar Agora
                  </span>
                </button>
                
                {/* Botão "Não exibir novamente" */}
                <button
                  onClick={handleNeverShowAgain}
                  className="w-full px-3 py-2 text-white/80 hover:text-white text-sm 
                           hover:bg-white/10 rounded-lg transition-all duration-200
                           flex items-center justify-center gap-2"
                >
                  <FaEyeSlash className="text-xs" />
                  Não exibir novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de instruções */}
      {showInstructions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                    {instructions.icon}
                  </div>
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
                <div className="mb-5 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300 dark:border-yellow-700">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ Instalação de PWA requer HTTPS. Configure um certificado SSL para habilitar a instalação automática.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {instructions.steps.map((step, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-9 h-9 bg-green-100 dark:bg-green-800/40 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-1">
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
