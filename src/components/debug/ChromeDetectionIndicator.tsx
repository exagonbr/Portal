'use client';

import { useEffect, useState } from 'react';
import { isChromeOrChromeMobile } from '@/utils/chromeDetection';

interface ChromeDetectionIndicatorProps {
  show?: boolean;
  className?: string;
}

/**
 * Componente de debug que indica se Chrome foi detectado
 * e se a correção de reload foi aplicada
 * 
 * @param show - Se deve mostrar o indicador (default: false para não aparecer em produção)
 * @param className - Classes CSS adicionais
 */
export function ChromeDetectionIndicator({ 
  show = false, 
  className = '' 
}: ChromeDetectionIndicatorProps) {
  const [mounted, setMounted] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [hasNoCacheParam, setHasNoCacheParam] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsChrome(isChromeOrChromeMobile());
    
    // Verificar se tem parâmetro _nocache (indica que reload foi aplicado)
    const urlParams = new URLSearchParams(window.location.search);
    setHasNoCacheParam(urlParams.has('_nocache'));
  }, []);

  // Só mostrar se especificamente solicitado (para debug)
  if (!show || !mounted) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-sm ${className}`}
         style={{
           backgroundColor: isChrome ? 'rgba(59, 130, 246, 0.9)' : 'rgba(34, 197, 94, 0.9)',
           color: 'white'
         }}>
      <div className="font-semibold mb-1">
        {isChrome ? '🌐 Chrome Detectado' : '🌐 Outro Navegador'}
      </div>
      <div className="space-y-1 text-xs">
        <div>Navegador: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Outro'}</div>
        <div>Mobile: {/mobile|android/i.test(navigator.userAgent) ? 'Sim' : 'Não'}</div>
        <div>Reload aplicado: {hasNoCacheParam ? '✅ Sim' : '❌ Não'}</div>
        <div>UserAgent: {navigator.userAgent.substring(0, 50)}...</div>
      </div>
    </div>
  );
}

/**
 * Hook para obter informações sobre a detecção do Chrome
 * Útil para usar em outros componentes se necessário
 */
export function useChromeDetection() {
  const [mounted, setMounted] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [hasNoCacheParam, setHasNoCacheParam] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsChrome(isChromeOrChromeMobile());
    
    const urlParams = new URLSearchParams(window.location.search);
    setHasNoCacheParam(urlParams.has('_nocache'));
  }, []);

  return {
    mounted,
    isChrome,
    hasNoCacheParam,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
  };
} 