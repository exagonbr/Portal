/**
 * Utilitário para detectar Chrome e forçar reload da página ignorando cache
 * Solução específica para problema de carregamento apenas no Chrome (desktop e mobile)
 */

/**
 * Detecta se o navegador é Chrome (desktop ou mobile)
 */
export function isChromeOrChromeMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detectar Chrome desktop
  const isChromeDesktop = userAgent.includes('chrome') && 
                         !userAgent.includes('edge') && 
                         !userAgent.includes('opr') && 
                         !userAgent.includes('firefox');
  
  // Detectar Chrome mobile (Android)
  const isChromeMobile = userAgent.includes('chrome') && 
                        (userAgent.includes('mobile') || userAgent.includes('android'));
  
  // Detectar Chrome no iOS (CriOS)
  const isChromeIOS = userAgent.includes('crios');
  
  return isChromeDesktop || isChromeMobile || isChromeIOS;
}

/**
 * Força o reload da página ignorando o cache
 * Usa diferentes métodos dependendo do suporte do navegador
 */
export function forcePageReload(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Método 1: location.reload(true) - deprecado mas ainda funciona em alguns navegadores
    if ('reload' in window.location) {
      (window.location as any).reload(true);
      return;
    }
  } catch (error) {
    console.log('Método reload(true) não disponível, tentando alternativa...');
  }
  
  try {
    // Método 2: Adicionar timestamp para forçar bypass do cache
    const currentUrl = window.location.href;
    const separator = currentUrl.includes('?') ? '&' : '?';
    const timestamp = Date.now();
    const newUrl = `${currentUrl}${separator}_nocache=${timestamp}`;
    
    window.location.replace(newUrl);
  } catch (error) {
    console.log('Método com timestamp falhou, usando reload padrão...');
    
    // Método 3: Fallback para reload padrão
    window.location.reload();
  }
}

/**
 * Força o reload da página apenas se for Chrome
 * Implementa a lógica específica para o problema reportado
 */
export function forceReloadIfChrome(): boolean {
  if (!isChromeOrChromeMobile()) {
    console.log('🌐 Não é Chrome, reload não necessário');
    return false;
  }
  
  console.log('🔄 Chrome detectado, forçando reload da página ignorando cache...');
  
  // Adicionar um delay pequeno para garantir que a detecção seja processada
  setTimeout(() => {
    forcePageReload();
  }, 100);
  
  return true;
}

/**
 * Hook personalizado para uso em componentes React
 * Executa o reload automático se for Chrome
 */
export function useChromeReloadFix(): {
  isChrome: boolean;
  forceReload: () => void;
} {
  const isChrome = isChromeOrChromeMobile();
  
  return {
    isChrome,
    forceReload: forcePageReload
  };
}

/**
 * Limpa o cache do navegador (quando possível)
 * Métodos adicionais para tentar limpar o cache
 */
export function clearBrowserCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Limpar localStorage
    localStorage.clear();
    
    // Limpar sessionStorage
    sessionStorage.clear();
    
    // Tentar limpar cache de service worker se disponível
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // Tentar usar Cache API se disponível
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    console.log('✅ Cache do navegador limpo');
  } catch (error) {
    console.log('⚠️ Não foi possível limpar todo o cache:', error);
  }
}

/**
 * Solução completa: detecta Chrome e aplica todas as correções necessárias
 */
export function applyChromeLoginFix(): void {
  if (!isChromeOrChromeMobile()) return;
  
  console.log('🔧 Aplicando correção para Chrome no login...');
  
  // Limpar cache primeiro
  clearBrowserCache();
  
  // Forçar reload após limpeza
  setTimeout(() => {
    forcePageReload();
  }, 200);
} 