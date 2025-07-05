/**
 * Sistema de Controle de Redirecionamento
 * Previne loops infinitos entre páginas
 */

let redirectCount = 0;
let lastRedirect = '';
let redirectHistory: string[] = [];
const MAX_REDIRECTS = 3;
const HISTORY_LIMIT = 10;
let lastResetTime = Date.now();

/**
 * Verifica se um redirecionamento é seguro (não causa loop)
 */
export function canRedirect(path: string): boolean {
  const now = Date.now();
  
  // Reset automático a cada 30 segundos
  if (now - lastResetTime > 30000) {
    resetRedirectControl();
    lastResetTime = now;
  }

  // Verificar se é o mesmo redirecionamento consecutivo
  if (lastRedirect === path) {
    redirectCount++;
    
    if (redirectCount >= MAX_REDIRECTS) {
      console.warn(`🔄 LOOP DETECTADO: Bloqueando redirecionamento para ${path} (tentativa ${redirectCount})`);
      logRedirectHistory();
      return false;
    }
  } else {
    // Novo destino, resetar contador mas manter histórico
    redirectCount = 1;
    lastRedirect = path;
  }

  // Adicionar ao histórico
  redirectHistory.push(`${new Date().toISOString()}: ${path}`);
  
  // Limitar tamanho do histórico
  if (redirectHistory.length > HISTORY_LIMIT) {
    redirectHistory = redirectHistory.slice(-HISTORY_LIMIT);
  }

  console.log(`✅ REDIRECIONAMENTO PERMITIDO: ${path} (tentativa ${redirectCount})`);
  return true;
}

/**
 * Reset completo do controle
 */
export function resetRedirectControl(): void {
  console.log('🔄 RESET do controle de redirecionamento');
  redirectCount = 0;
  lastRedirect = '';
  redirectHistory = [];
  lastResetTime = Date.now();
}

/**
 * Força um redirecionamento mesmo com restrições (emergência)
 */
export function forceRedirect(path: string): void {
  console.log(`🚨 REDIRECIONAMENTO FORÇADO: ${path}`);
  resetRedirectControl();
  
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
}

/**
 * Obtém estatísticas do controle
 */
export function getRedirectStats() {
  return {
    redirectCount,
    lastRedirect,
    history: [...redirectHistory],
    isBlocked: redirectCount >= MAX_REDIRECTS
  };
}

/**
 * Log do histórico de redirecionamentos
 */
function logRedirectHistory(): void {
  console.group('📊 HISTÓRICO DE REDIRECIONAMENTOS');
  redirectHistory.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry}`);
  });
  console.groupEnd();
}

/**
 * Verifica se está em um possível loop
 */
export function isInLoop(): boolean {
  return redirectCount >= MAX_REDIRECTS;
}

/**
 * Obtém uma rota de emergência baseada no contexto
 */
export function getEmergencyRoute(): string {
  if (typeof window === 'undefined') return '/login';
  
  const currentPath = window.location.pathname;
  
  // Se está em login, ir para portal
  if (currentPath.includes('/login')) {
    return '/portal/books';
  }
  
  // Se está em dashboard, ir para login
  if (currentPath.includes('/dashboard')) {
    return '/login?reset=true';
  }
  
  // Fallback padrão
  return '/login?emergency=true';
}

/**
 * Função utilitária para redirecionamento seguro
 */
export function safeRedirect(
  router: any, 
  path: string, 
  force: boolean = false
): boolean {
  if (force || canRedirect(path)) {
    try {
      console.log(`🎯 REDIRECIONAMENTO SEGURO: ${path}`);
      router.push(path);
      return true;
    } catch (error) {
      console.log('❌ ERRO NO REDIRECIONAMENTO:', error);
      
      // Fallback para window.location
      if (typeof window !== 'undefined') {
        window.location.href = path;
        return true;
      }
      return false;
    }
  }
  
  console.warn(`🚫 REDIRECIONAMENTO BLOQUEADO: ${path}`);
  return false;
}

/**
 * Reset de emergência para casos críticos
 */
export function emergencyReset(): void {
  console.log('🚨 RESET DE EMERGÊNCIA ATIVADO');
  resetRedirectControl();
  
  // Limpar localStorage relacionado à autenticação
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('selectedRole');
      localStorage.removeItem('user_data');
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
    } catch (error) {
      console.log('❌ Erro ao limpar storage:', error);
    }
    
    // Redirecionar para login após delay
    setTimeout(() => {
      window.location.href = '/auth/login?emergency=true';
    }, 1000);
  }
} 