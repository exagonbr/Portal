'use client';

import { useEffect, useState } from 'react';
import { FaApple, FaTimes, FaShare } from 'react-icons/fa';

export function IOSInstallBanner() {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    setIsIOS(isIOSDevice);

    // Verificar se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.matchMedia('(display-mode: fullscreen)').matches ||
                        (window.navigator as any).standalone === true;
    
    setIsInstalled(isStandalone);

    // Verificar se o banner já foi fechado
    const bannerDismissed = localStorage.getItem('ios-install-banner-dismissed') === 'true';
    
    // Mostrar banner apenas se: é iOS, não está instalado, e não foi fechado
    if (isIOSDevice && !isStandalone && !bannerDismissed) {
      // Aguardar um pouco antes de mostrar o banner
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('ios-install-banner-dismissed', 'true');
  };

  if (!isIOS || isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaApple className="text-2xl" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">
                  Instale o Portal Sabercon no seu iPhone
                </p>
                <p className="text-xs opacity-90 flex items-center gap-1 mt-1">
                  Toque em <FaShare className="inline" /> e depois em "Adicionar à Tela de Início"
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Fechar"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 