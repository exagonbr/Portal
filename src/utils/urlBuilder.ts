/**
 * Utilitário para construir URLs usando as variáveis de ambiente FRONTEND_URL ou NEXTAUTH_URL
 */

/**
 * Constrói uma URL completa usando as variáveis de ambiente
 * @param path - Caminho relativo (ex: '/auth/login', '/dashboard')
 * @returns URL completa ou caminho relativo se não houver variável de ambiente
 */
export function buildUrl(path: string): string {
  const frontendUrl = process.env.FRONTEND_URL;
  
  // Se não há URL base ou o path já é uma URL completa, retorna o path original
  if (!frontendUrl || path.startsWith('http') || path.startsWith('https')) {
    return path;
  }
  
  // Remove barra inicial do path se existir, pois a frontendUrl já deve incluir
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${frontendUrl}${cleanPath}`;
}

/**
 * Constrói URL de login com parâmetros opcionais
 * @param params - Parâmetros de query string (ex: { error: 'unauthorized' })
 * @returns URL completa para login
 */
export function buildLoginUrl(params?: Record<string, string>): string {
  let loginUrl = buildUrl('/auth/login');
  
  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    loginUrl += `?${queryString}`;
  }
  
  return loginUrl;
}

/**
 * Constrói URL de dashboard baseada na role do usuário
 * @param role - Role do usuário
 * @returns URL completa para o dashboard apropriado
 */
export function buildDashboardUrl(role: string): string {
  const dashboardPaths: Record<string, string> = {
    'SYSTEM_ADMIN': '/dashboard/system-admin',
    'INSTITUTION_MANAGER': '/dashboard/institution-manager',
    'COORDINATOR': '/dashboard/coordinator',
    'STUDENT': '/dashboard/student',
    'TEACHER': '/dashboard/teacher',
    'GUARDIAN': '/dashboard/guardian'
  };
  
  const path = dashboardPaths[role] || '/dashboard';
  return buildUrl(path);
}

/**
 * Verifica se uma URL é externa (não pertence ao domínio atual)
 * @param url - URL para verificar
 * @returns true se a URL é externa
 */
export function isExternalUrl(url: string): boolean {
  if (!url.startsWith('http')) {
    return false;
  }
  
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    return true;
  }
  
  return !url.startsWith(frontendUrl);
}