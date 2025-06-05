'use client';

import { useState } from 'react';
import { FaDownload, FaMobileAlt } from 'react-icons/fa';
import { usePWAInstall } from '@/hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'floating' | 'inline' | 'banner';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export function PWAInstallButton({ 
  variant = 'inline', 
  position = 'bottom-right',
  className = '' 
}: PWAInstallButtonProps) {
  const { isInstalled, canInstall, platform, install } = usePWAInstall();
  const [showTooltip, setShowTooltip] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    if (canInstall) {
      const success = await install();
      if (!success) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }
    } else {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  if (variant === 'floating') {
    return (
      <div className={`fixed ${getPositionClasses()} z-40 ${className}`}>
        <button
          onClick={handleInstall}
          className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-full shadow-lg 
                     hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-110
                     hover:shadow-2xl"
          aria-label="Instalar aplicativo"
        >
          <FaDownload className="text-xl" />
          
          {/* Tooltip */}
          <div className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white 
                          text-sm rounded-lg whitespace-nowrap transition-opacity duration-300
                          ${showTooltip ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            Instalar aplicativo
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 
                          border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                      rounded-lg p-4 flex items-center justify-between shadow-lg ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <FaMobileAlt className="text-2xl" />
          </div>
          <div>
            <h3 className="font-bold">Instale nosso aplicativo</h3>
            <p className="text-sm opacity-90">
              Acesso rápido e funciona offline
            </p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-white text-green-600 font-bold rounded-lg
                     hover:bg-gray-50 transition-all duration-200 shadow-md
                     transform hover:scale-105 active:scale-95"
        >
          Instalar
        </button>
      </div>
    );
  }

  // Variant inline (default)
  return (
    <button
      onClick={handleInstall}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                 font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 
                 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95
                 ${className}`}
    >
      <FaDownload className="text-sm" />
      <span>Instalar App</span>
    </button>
  );
} 