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
        sessionStorage.getItem('chrome_reload_applied_main') === 'true') {
      return true;
    }
  } catch (error) {
    // Ignorar erros de acesso ao sessionStorage
  }
  
  // Verificar localStorage como último recurso
  try {
    if (localStorage.getItem('chrome_reload_applied') === 'true') {
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
export function markReloadAsApplied(): void {
  if (typeof window === 'undefined') return;
  
  // Definir cookie (válido por 1 minuto)
  try {
    document.cookie = "chrome_reload_applied=true; path=/; max-age=60";
  } catch (error) {
    console.log('⚠️ Não foi possível definir cookie');
  }
  
  // Definir em sessionStorage
  try {
    sessionStorage.setItem('chrome_reload_applied', 'true');
    sessionStorage.setItem('chrome_reload_applied_main', 'true');
  } catch (error) {
    console.log('⚠️ Não foi possível salvar em sessionStorage');
  }
  
  // Definir em localStorage como backup
  try {
    localStorage.setItem('chrome_reload_applied', 'true');
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
  
  // Marcar que o reload foi aplicado em todos os mecanismos
  markReloadAsApplied();
  
  try {
    // Método 1: Adicionar timestamp para forçar bypass do cache (método mais seguro)
    const url = new URL(window.location.href);
    url.searchParams.set('_nocache', Date.now().toString());
    
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
  
  // Verificar se já foi aplicado reload para evitar loop
  if (isReloadAlreadyApplied()) {
    console.log('🛑 Correção para Chrome já aplicada anteriormente');
    return;
  }
  
  console.log('🔧 Aplicando correção para Chrome no login...');
  
  // Limpar cache primeiro
  clearBrowserCache();
  
  // Marcar que o reload foi aplicado
  markReloadAsApplied();
  
  // Forçar reload após limpeza
  setTimeout(() => {
    forcePageReload();
  }, 200);
} 