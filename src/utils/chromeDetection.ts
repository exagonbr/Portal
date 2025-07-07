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
                         !userAgent.includes('edg') && 
                         !userAgent.includes('opr') && 
                         !userAgent.includes('opera') && 
                         !userAgent.includes('firefox');
  
  // Detectar Chrome mobile (Android)
  const isChromeMobile = userAgent.includes('chrome') && 
                        (userAgent.includes('mobile') || 
                         userAgent.includes('android') || 
                         /android.*chrome\/[.0-9]*/.test(userAgent));
  
  // Detectar Chrome no iOS (CriOS)
  const isChromeIOS = userAgent.includes('crios');
  
  // Detectar dispositivo móvel (independente do navegador)
  const isMobileDevice = /iphone|ipod|ipad|android|blackberry|windows phone|opera mini|silk|mobile|tablet/i.test(userAgent);
  
  // Detectar Chrome em qualquer dispositivo móvel
  const isChromeMobileGeneric = isMobileDevice && (userAgent.includes('chrome') || userAgent.includes('crios'));
  
  // Retornar true se for qualquer tipo de Chrome (desktop ou mobile)
  return isChromeDesktop || isChromeMobile || isChromeIOS || isChromeMobileGeneric;
}

/**
 * Detecta se o dispositivo é móvel (qualquer navegador)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detecção por user agent
  const mobileByUserAgent = /iphone|ipod|ipad|android|blackberry|windows phone|opera mini|silk|mobile|tablet/i.test(userAgent);
  
  // Detecção por características do dispositivo
  const mobileByFeatures = typeof window.orientation !== 'undefined' || 
                          navigator.maxTouchPoints > 0 || 
                          ('ontouchstart' in window);
  
  // Detecção por largura da tela
  const mobileByScreenSize = window.innerWidth <= 768;
  
  return mobileByUserAgent || mobileByFeatures || mobileByScreenSize;
}

/**
 * Detecta especificamente se é Chrome em dispositivo móvel
 */
export function isChromeMobile(): boolean {
  if (!isMobileDevice()) return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Chrome em Android
  const isAndroidChrome = userAgent.includes('chrome') && userAgent.includes('android');
  
  // Chrome em iOS (CriOS)
  const isIOSChrome = userAgent.includes('crios');
  
  // Chrome genérico em mobile
  const isGenericMobileChrome = userAgent.includes('chrome') && 
                              (userAgent.includes('mobile') || 
                               userAgent.includes('android') ||
                               /mobile|android|iphone|ipod|ipad/i.test(userAgent));
  
  return isAndroidChrome || isIOSChrome || isGenericMobileChrome;
}

/**
 * Verifica se o reload já foi aplicado através de cookies, sessionStorage ou parâmetros
 * Função auxiliar para evitar loops de reload
 */
export function isReloadAlreadyApplied(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Verificar parâmetro na URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('_nocache')) {
    return true;
  }
  
  // Verificar cookie
  if (document.cookie.includes('chrome_reload_applied=true')) {
    return true;
  }
  
  // Verificar sessionStorage
  try {
    if (sessionStorage.getItem('chrome_reload_applied') === 'true' ||
        sessionStorage.getItem('chrome_reload_applied_main') === 'true' ||
        sessionStorage.getItem('chrome_mobile_reload_applied') === 'true') {
      return true;
    }
  } catch (error) {
    // Ignorar erros de acesso ao sessionStorage
  }
  
  // Verificar localStorage como último recurso
  try {
    if (localStorage.getItem('chrome_reload_applied') === 'true' ||
        localStorage.getItem('chrome_mobile_reload_applied') === 'true') {
      return true;
    }
  } catch (error) {
    // Ignorar erros de acesso ao localStorage
  }
  
  return false;
}

/**
 * Marca que o reload foi aplicado em todos os mecanismos de armazenamento disponíveis
 */
export function markReloadAsApplied(isMobile: boolean = false): void {
  if (typeof window === 'undefined') return;
  
  const suffix = isMobile ? '_mobile' : '';
  
  // Definir cookie (válido por 1 minuto)
  try {
    document.cookie = `chrome${suffix}_reload_applied=true; path=/; max-age=60`;
  } catch (error) {
    console.log('⚠️ Não foi possível definir cookie');
  }
  
  // Definir em sessionStorage
  try {
    sessionStorage.setItem(`chrome${suffix}_reload_applied`, 'true');
    sessionStorage.setItem(`chrome${suffix}_reload_applied_main`, 'true');
  } catch (error) {
    console.log('⚠️ Não foi possível salvar em sessionStorage');
  }
  
  // Definir em localStorage como backup
  try {
    localStorage.setItem(`chrome${suffix}_reload_applied`, 'true');
  } catch (error) {
    console.log('⚠️ Não foi possível salvar em localStorage');
  }
}

/**
 * Força o reload da página ignorando o cache
 * Usa diferentes métodos dependendo do suporte do navegador
 */
export function forcePageReload(): void {
  if (typeof window === 'undefined') return;
  
  // Verificar se já foi aplicado reload para evitar loop
  if (isReloadAlreadyApplied()) {
    console.log('🛑 Reload já foi aplicado anteriormente, evitando loop');
    return;
  }
  
  // Verificar se é dispositivo móvel
  const mobile = isMobileDevice();
  
  // Marcar que o reload foi aplicado em todos os mecanismos
  markReloadAsApplied(mobile);
  
  try {
    // Método 1: Adicionar timestamp para forçar bypass do cache (método mais seguro)
    const url = new URL(window.location.href);
    url.searchParams.set('_nocache', Date.now().toString());
    
    // Para mobile, adicionar um parâmetro específico
    if (mobile) {
      url.searchParams.set('_mobile', '1');
    }
    
    // Usar replace para não adicionar à história do navegador
    window.location.replace(url.toString());
    return;
  } catch (error) {
    console.log('Método com timestamp falhou, tentando alternativa...');
  }
  
  try {
    // Método 2: location.reload(true) - deprecado mas ainda funciona em alguns navegadores
    if ('reload' in window.location) {
      (window.location as any).reload(true);
      return;
    }
  } catch (error) {
    console.log('Método reload(true) não disponível, usando reload padrão...');
  }
  
  // Método 3: Fallback para reload padrão
  window.location.reload();
}

/**
 * Força o reload da página apenas se for Chrome
 * Implementa a lógica específica para o problema reportado
 */
export function forceReloadIfChrome(): boolean {
  // Verificar se já foi aplicado reload para evitar loop
  if (isReloadAlreadyApplied()) {
    console.log('🛑 Reload já foi aplicado anteriormente, evitando loop');
    return false;
  }

  if (!isChromeOrChromeMobile()) {
    console.log('🌐 Não é Chrome, reload não necessário');
    return false;
  }
  
  // Verificar se é mobile para log específico
  const mobile = isMobileDevice();
  console.log(`🔄 Chrome ${mobile ? 'Mobile' : 'Desktop'} detectado, forçando reload da página ignorando cache...`);
  
  // Adicionar um delay pequeno para garantir que a detecção seja processada
  setTimeout(() => {
    forcePageReload();
  }, 100);
  
  return true;
}

/**
 * Força o reload da página apenas se for Chrome Mobile
 * Versão específica para dispositivos móveis
 */
export function forceReloadIfChromeMobile(): boolean {
  // Verificar se já foi aplicado reload para evitar loop
  if (isReloadAlreadyApplied()) {
    console.log('🛑 Reload já foi aplicado anteriormente, evitando loop');
    return false;
  }

  // Verificar se é Chrome Mobile
  if (!isChromeMobile()) {
    console.log('🌐 Não é Chrome Mobile, reload não necessário');
    return false;
  }
  
  console.log('📱 Chrome Mobile detectado, forçando reload da página ignorando cache...');
  
  // Adicionar um delay pequeno para garantir que a detecção seja processada
  setTimeout(() => {
    // Marcar especificamente como mobile
    markReloadAsApplied(true);
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
  isMobile: boolean;
  isChromeMobile: boolean;
  forceReload: () => void;
} {
  const isChrome = isChromeOrChromeMobile();
  const mobile = isMobileDevice();
  const chromeMobile = isChromeMobile();
  
  return {
    isChrome,
    isMobile: mobile,
    isChromeMobile: chromeMobile,
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
 * Limpa o cache específico para dispositivos móveis
 * Implementa técnicas adicionais específicas para mobile
 */
export function clearMobileBrowserCache(): void {
  if (typeof window === 'undefined') return;
  
  // Primeiro limpar cache padrão
  clearBrowserCache();
  
  try {
    // Técnicas específicas para mobile
    
    // 1. Limpar cookies específicos para mobile
    const mobileCookies = ['_mobile_session', 'mobile_view', 'mobile_cache'];
    mobileCookies.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // 2. Adicionar parâmetros específicos na URL para forçar reload em mobile
    if (isMobileDevice()) {
      const url = new URL(window.location.href);
      url.searchParams.set('_mobile_nocache', Date.now().toString());
      url.searchParams.set('_mobile', '1');
      
      // Não redirecionar aqui, apenas preparar a URL para uso posterior
      console.log('📱 URL preparada para reload em mobile:', url.toString());
    }
    
    console.log('✅ Cache do navegador mobile limpo');
  } catch (error) {
    console.log('⚠️ Não foi possível limpar todo o cache mobile:', error);
  }
}

/**
 * Solução completa: detecta Chrome e aplica todas as correções necessárias
 */
export function applyChromeLoginFix(): void {
  if (!isChromeOrChromeMobile()) return;
  
  // Verificar se já foi aplicado reload para evitar loop
  if (isReloadAlreadyApplied()) {
    console.log('🛑 Correção para Chrome já aplicada anteriormente');
    return;
  }
  
  // Verificar se é mobile para log específico
  const mobile = isMobileDevice();
  console.log(`🔧 Aplicando correção para Chrome ${mobile ? 'Mobile' : 'Desktop'} no login...`);
  
  // Limpar cache específico para o tipo de dispositivo
  if (mobile) {
    clearMobileBrowserCache();
  } else {
    clearBrowserCache();
  }
  
  // Marcar que o reload foi aplicado
  markReloadAsApplied(mobile);
  
  // Forçar reload após limpeza
  setTimeout(() => {
    forcePageReload();
  }, 200);
} 