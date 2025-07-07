'use client';

import { useEffect, useState } from 'react';
import { isChromeOrChromeMobile, isMobileDevice, isChromeMobile } from '@/utils/chromeDetection';

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
  const [isMobile, setIsMobile] = useState(false);
  const [isChromeMobileOnly, setIsChromeMobileOnly] = useState(false);
  const [hasNoCacheParam, setHasNoCacheParam] = useState(false);
  const [hasMobileParam, setHasMobileParam] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsChrome(isChromeOrChromeMobile());
    setIsMobile(isMobileDevice());
    setIsChromeMobileOnly(isChromeMobile());
    
    // Verificar se tem parâmetros na URL
    const urlParams = new URLSearchParams(window.location.search);
    setHasNoCacheParam(urlParams.has('_nocache'));
    setHasMobileParam(urlParams.has('_mobile'));
  }, []);

  // Só mostrar se especificamente solicitado (para debug)
  if (!show || !mounted) return null;

  // Determinar cor de fundo com base no tipo de navegador
  const getBgColor = () => {
    if (isChrome && isMobile) return 'rgba(220, 38, 38, 0.9)'; // Vermelho para Chrome Mobile
    if (isChrome) return 'rgba(59, 130, 246, 0.9)'; // Azul para Chrome Desktop
    if (isMobile) return 'rgba(245, 158, 11, 0.9)'; // Laranja para outros Mobile
    return 'rgba(34, 197, 94, 0.9)'; // Verde para outros navegadores
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-sm ${className}`}
         style={{
           backgroundColor: getBgColor(),
           color: 'white'
         }}>
      <div className="font-semibold mb-1">
        {isChrome && isMobile ? '📱 Chrome Mobile Detectado' : 
         isChrome ? '🌐 Chrome Desktop Detectado' : 
         isMobile ? '📱 Outro Navegador Mobile' : '🌐 Outro Navegador Desktop'}
      </div>
      <div className="space-y-1 text-xs">
        <div>Navegador: {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Outro'}</div>
        <div>Mobile: {isMobile ? '✅ Sim' : '❌ Não'}</div>
        <div>Chrome Mobile: {isChromeMobileOnly ? '✅ Sim' : '❌ Não'}</div>
        <div>Reload aplicado: {hasNoCacheParam ? '✅ Sim' : '❌ Não'}</div>
        <div>Param Mobile: {hasMobileParam ? '✅ Sim' : '❌ Não'}</div>
        <div className="text-[10px] break-all mt-2">
          <span className="font-bold">UserAgent:</span> {navigator.userAgent.substring(0, 100)}...
        </div>
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
  const [isMobile, setIsMobile] = useState(false);
  const [isChromeMobileOnly, setIsChromeMobileOnly] = useState(false);
  const [hasNoCacheParam, setHasNoCacheParam] = useState(false);
  const [hasMobileParam, setHasMobileParam] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsChrome(isChromeOrChromeMobile());
    setIsMobile(isMobileDevice());
    setIsChromeMobileOnly(isChromeMobile());
    
    const urlParams = new URLSearchParams(window.location.search);
    setHasNoCacheParam(urlParams.has('_nocache'));
    setHasMobileParam(urlParams.has('_mobile'));
  }, []);

  return {
    mounted,
    isChrome,
    isMobile,
    isChromeMobile: isChromeMobileOnly,
    hasNoCacheParam,
    hasMobileParam,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
  };
} 