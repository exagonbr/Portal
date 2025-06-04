import { UserRole } from '../types/auth';

/**
 * Mapeia roles de usuário para seus respectivos dashboards
 * Inclui tanto roles em português (do backend) quanto em inglês (frontend)
 */
export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  // Roles em inglês (padrão do sistema)
  'student': '/dashboard/student',
  'teacher': '/dashboard/teacher',
  'admin': '/dashboard/system-admin',
  'manager': '/dashboard/institution-manager',
  'system_admin': '/dashboard/system-admin',
  'institution_manager': '/dashboard/institution-manager',
  'academic_coordinator': '/dashboard/coordinator',
  'coordinator': '/dashboard/coordinator',
  'guardian': '/dashboard/guardian',
  
  // Roles em português (vindas do backend) - lowercase
  'aluno': '/dashboard/student',
  'professor': '/dashboard/teacher',
  'administrador': '/dashboard/system-admin',
  'gestor': '/dashboard/institution-manager',
  'coordenador acadêmico': '/dashboard/coordinator',
  'coordenador': '/dashboard/coordinator',
  'responsável': '/dashboard/guardian',
  
  // Roles em português com primeira letra maiúscula
  'Aluno': '/dashboard/student',
  'Professor': '/dashboard/teacher',
  'Administrador': '/dashboard/system-admin',
  'Gestor': '/dashboard/institution-manager',
  'Coordenador Acadêmico': '/dashboard/coordinator',
  'Coordenador': '/dashboard/coordinator',
  'Responsável': '/dashboard/guardian',
  
  // Variações em maiúsculas
  'ALUNO': '/dashboard/student',
  'PROFESSOR': '/dashboard/teacher',
  'ADMINISTRADOR': '/dashboard/system-admin',
  'GESTOR': '/dashboard/institution-manager',
  'COORDENADOR ACADÊMICO': '/dashboard/coordinator',
  'COORDENADOR': '/dashboard/coordinator',
  'RESPONSÁVEL': '/dashboard/guardian',
  
  // Roles do enum UserRole (CRÍTICO: SYSTEM_ADMIN deve ir para system-admin)
  'STUDENT': '/dashboard/student',
  'TEACHER': '/dashboard/teacher',
  'SYSTEM_ADMIN': '/dashboard/system-admin',
  'INSTITUTION_MANAGER': '/dashboard/institution-manager',
  'ACADEMIC_COORDINATOR': '/dashboard/coordinator',
  'GUARDIAN': '/dashboard/guardian'
};

/**
 * Normaliza a role para um formato consistente
 * @param role - Role original
 * @returns Role normalizada em lowercase
 */
export function normalizeRole(role: string | undefined | null): string | null {
  if (!role) return null;
  
  // Remove espaços extras e converte para lowercase
  const normalized = role.trim().toLowerCase();
  
  // Mapeamento de variações para role padrão
  const roleVariations: Record<string, string> = {
    'aluno': 'student',
    'estudante': 'student',
    'professor': 'teacher',
    'docente': 'teacher',
    'administrador': 'system_admin',
    'admin': 'system_admin',
    'system_admin': 'system_admin',
    'gestor': 'institution_manager',
    'gerente': 'institution_manager',
    'institution_manager': 'institution_manager',
    'coordenador acadêmico': 'academic_coordinator',
    'coordenador': 'academic_coordinator',
    'academic_coordinator': 'academic_coordinator',
    'responsável': 'guardian',
    'pai': 'guardian',
    'mãe': 'guardian',
    'guardian': 'guardian'
  };
  
  return roleVariations[normalized] || normalized;
}

/**
 * Obtém o caminho do dashboard baseado na role do usuário
 * @param role - Role do usuário (pode estar em qualquer formato)
 * @returns Caminho do dashboard ou null se role inválida
 */
export function getDashboardPath(role: string | undefined | null): string | null {
  if (!role) {
    console.log('❌ getDashboardPath: role é null/undefined');
    return null;
  }

  console.log(`🔍 getDashboardPath: buscando dashboard para role "${role}"`);

  // Primeiro tenta buscar exatamente como recebido
  let dashboardPath = ROLE_DASHBOARD_MAP[role];
  
  if (dashboardPath) {
    console.log(`✅ getDashboardPath: encontrado diretamente - ${role} -> ${dashboardPath}`);
    return dashboardPath;
  }

  // Se não encontrou, tenta normalizar
  const normalizedRole = normalizeRole(role);
  console.log(`🔄 getDashboardPath: role normalizada: "${role}" → "${normalizedRole}"`);
  
  if (normalizedRole) {
    dashboardPath = ROLE_DASHBOARD_MAP[normalizedRole];
    
    if (dashboardPath) {
      console.log(`✅ getDashboardPath: encontrado após normalização - ${role} → ${normalizedRole} → ${dashboardPath}`);
      return dashboardPath;
    }
  }

  // Se ainda não encontrou, tenta buscar por lowercase da role original
  const lowercaseRole = role.toLowerCase();
  dashboardPath = ROLE_DASHBOARD_MAP[lowercaseRole];
  
  if (dashboardPath) {
    console.log(`✅ getDashboardPath: encontrado em lowercase - ${role} → ${lowercaseRole} → ${dashboardPath}`);
    return dashboardPath;
  }
  
  // Se mesmo assim não encontrou, tenta matching parcial
  const matchingRoles = Object.keys(ROLE_DASHBOARD_MAP).filter(
    key => key.includes(role) || role.includes(key)
  );
  
  if (matchingRoles.length > 0) {
    const closestMatch = matchingRoles[0];
    dashboardPath = ROLE_DASHBOARD_MAP[closestMatch];
    console.log(`⚠️ getDashboardPath: usando matching parcial - ${role} → ${closestMatch} → ${dashboardPath}`);
    return dashboardPath;
  }
  
  // Último recurso: dashboard genérico
  console.error(`❌ getDashboardPath: nenhum dashboard encontrado para role "${role}"`);
  console.log(`🔍 Roles disponíveis:`, Object.keys(ROLE_DASHBOARD_MAP).join(', '));
  
  // Fallback para dashboard genérico
  return '/dashboard';
}

/**
 * Verifica se uma role é válida
 * @param role - Role a ser verificada
 * @returns true se a role é válida
 */
export function isValidRole(role: string | undefined | null): boolean {
  if (!role) return false;
  
  // Verifica se existe mapeamento direto
  if (role in ROLE_DASHBOARD_MAP) {
    return true;
  }
  
  // Verifica se existe após normalização
  const normalizedRole = normalizeRole(role);
  if (normalizedRole && normalizedRole in ROLE_DASHBOARD_MAP) {
    return true;
  }
  
  // Verifica se existe em lowercase
  const lowercaseRole = role.toLowerCase();
  if (lowercaseRole in ROLE_DASHBOARD_MAP) {
    return true;
  }
  
  return false;
}

/**
 * Obtém uma lista de todas as roles válidas
 */
export function getAllValidRoles(): string[] {
  return Object.keys(ROLE_DASHBOARD_MAP);
}

/**
 * Converte role do backend para role do frontend
 * @param backendRole - Role vinda do backend
 * @returns Role compatível com o frontend
 */
export function convertBackendRole(backendRole: string | undefined | null): string | null {
  if (!backendRole) return null;
  
  console.log(`🔄 convertBackendRole: convertendo "${backendRole}"`);
  
  // Para SYSTEM_ADMIN, retorna diretamente
  if (backendRole === 'SYSTEM_ADMIN') {
    console.log(`✅ convertBackendRole: SYSTEM_ADMIN -> system_admin`);
    return 'system_admin';
  }
  
  const normalized = normalizeRole(backendRole);
  console.log(`✅ convertBackendRole: ${backendRole} -> ${normalized}`);
  
  return normalized || backendRole.toLowerCase();
}

/**
 * Interface para mapear permissões às páginas acessíveis
 */
export interface PermissionRouteMap {
  [permission: string]: string[];
}

/**
 * Mapeamento de permissões para rotas acessíveis
 */
export const PERMISSION_ROUTES: PermissionRouteMap = {
  // Permissões de gerenciamento de usuários
  'create:user': ['/dashboard/system-admin/users', '/dashboard/institution-manager/users'],
  'read:user': ['/dashboard/system-admin/users', '/dashboard/institution-manager/users', '/dashboard/coordinator/users'],
  'update:user': ['/dashboard/system-admin/users', '/dashboard/institution-manager/users'],
  'delete:user': ['/dashboard/system-admin/users'],
  
  // Permissões de gerenciamento de cursos
  'create:course': ['/dashboard/system-admin/courses', '/dashboard/institution-manager/courses'],
  'read:course': ['/dashboard/system-admin/courses', '/dashboard/institution-manager/courses', 
                 '/dashboard/coordinator/courses', '/dashboard/teacher/courses', '/dashboard/student/courses'],
  'update:course': ['/dashboard/system-admin/courses', '/dashboard/institution-manager/courses', '/dashboard/teacher/courses'],
  'delete:course': ['/dashboard/system-admin/courses', '/dashboard/institution-manager/courses'],
  
  // Permissões de instituição
  'manage:institution': ['/dashboard/system-admin/institutions', '/dashboard/institution-manager/institution'],
  
  // Permissões de relatórios
  'view:reports': ['/dashboard/system-admin/reports', '/dashboard/institution-manager/reports', '/dashboard/coordinator/reports'],
  
  // Permissões de estudantes
  'manage:students': ['/dashboard/coordinator/students', '/dashboard/teacher/students'],
  
  // Permissões de conteúdo
  'create:content': ['/dashboard/teacher/content', '/dashboard/coordinator/content'],
  'read:content': ['/dashboard/student/content', '/dashboard/teacher/content', '/dashboard/coordinator/content'],
  'update:content': ['/dashboard/teacher/content', '/dashboard/coordinator/content'],
  'delete:content': ['/dashboard/teacher/content', '/dashboard/coordinator/content'],
};

/**
 * Determina o dashboard correto com base nas permissões do usuário
 * @param role - Role principal do usuário
 * @param permissions - Lista de permissões do usuário
 * @returns Caminho do dashboard mais apropriado
 */
export function getDashboardByPermissions(role: string | undefined | null, permissions: string[] = []): string {
  console.log(`🔍 getDashboardByPermissions: Iniciando para role "${role}" com ${permissions.length} permissões`);
  
  // PRIORIDADE 1: Dashboard baseado na role (mais estável)
  const dashboardByRole = getDashboardPath(role);
  if (dashboardByRole && dashboardByRole !== '/dashboard') {
    console.log(`✅ getDashboardByPermissions: Usando dashboard baseado na role: ${dashboardByRole}`);
    return dashboardByRole;
  }
  
  // PRIORIDADE 2: Se não tiver role válida ou não encontrou dashboard por role,
  // então verifica permissões (só como fallback)
  if (!permissions || permissions.length === 0) {
    console.log(`ℹ️ getDashboardByPermissions: Sem permissões definidas, usando dashboard genérico`);
    return '/dashboard';
  }

  console.log(`🔑 getDashboardByPermissions: Analisando ${permissions.length} permissões: ${permissions.join(', ')}`);
  
  // Verifica permissões de administração do sistema (casos especiais)
  const adminPermissions = ['admin:access', 'system:all', 'manage:system', 'admin:system'];
  if (permissions.some(p => adminPermissions.includes(p))) {
    console.log(`✅ getDashboardByPermissions: Permissão de administrador detectada, redirecionando para dashboard admin`);
    return '/dashboard/system-admin';
  }
  
  // Casos especiais para perfis administrativos baseados na role (fallback)
  if (role === 'system_admin' || role === 'SYSTEM_ADMIN' || role === 'admin' || role === 'administrador') {
    console.log(`✅ getDashboardByPermissions: Role de administrador detectada: ${role}`);
    return '/dashboard/system-admin';
  }
  
  // Permissões prioritárias (ordem de precedência) - só usa se não conseguiu determinar pela role
  const priorityPermissions: [string, string][] = [
    ['manage:institution', '/dashboard/institution-manager'],
    ['create:user', '/dashboard/institution-manager'],
    ['manage:schools', '/dashboard/institution-manager'],
    ['manage:classes', '/dashboard/coordinator'],
    ['manage:students', '/dashboard/coordinator'],
    ['create:content', '/dashboard/teacher'],
    ['manage:courses', '/dashboard/teacher'],
    ['read:content', '/dashboard/student'],
    ['view:grades', '/dashboard/student']
  ];
  
  // Verifica permissões em ordem de prioridade
  for (const [permission, dashboard] of priorityPermissions) {
    if (permissions.includes(permission)) {
      console.log(`✅ getDashboardByPermissions: Permissão prioritária encontrada: ${permission} -> ${dashboard}`);
      return dashboard;
    }
  }
  
  // FALLBACK FINAL: Dashboard genérico se não conseguiu determinar nada
  console.log(`⚠️ getDashboardByPermissions: Não foi possível determinar dashboard específico, usando genérico`);
  return '/dashboard';
}

/**
 * Verifica se o usuário tem permissão para acessar uma rota específica
 * @param permissions - Lista de permissões do usuário
 * @param route - Rota a ser verificada
 * @returns true se tem permissão, false caso contrário
 */
export function hasPermissionForRoute(permissions: string[] = [], route: string): boolean {
  // Se não tiver permissões definidas, nega acesso
  if (!permissions || permissions.length === 0) {
    console.log(`❌ Sem permissões definidas, negando acesso a: ${route}`);
    return false;
  }
  
  console.log(`🔍 Verificando permissões para rota: ${route}`);
  console.log(`🔑 Permissões disponíveis: ${permissions.join(', ')}`);
  
  // Permissões universais que dão acesso a qualquer rota
  const universalPermissions = ['admin:access', 'system:all', 'admin:system'];
  const hasUniversalPermission = permissions.some(p => universalPermissions.includes(p));
  
  if (hasUniversalPermission) {
    console.log(`✅ Permissão universal detectada, concedendo acesso a: ${route}`);
    return true;
  }
  
  // Para cada permissão do usuário, verifica se dá acesso à rota
  for (const permission of permissions) {
    const allowedRoutes = PERMISSION_ROUTES[permission] || [];
    
    // Verifica se alguma rota permitida é um prefixo da rota solicitada
    if (allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute))) {
      console.log(`✅ Permissão ${permission} concede acesso a: ${route}`);
      return true;
    }
  }
  
  // Casos especiais para rotas específicas
  if (route === '/dashboard' || route === '/profile') {
    console.log(`✅ Rota de acesso universal (${route}), concedendo acesso`);
    return true;
  }
  
  console.log(`❌ Nenhuma permissão concede acesso a: ${route}`);
  return false;
}

/**
 * Função de teste para verificar as permissões de notificação
 */
export function testNotificationPermissions() {
  const testRoles = [
    'SYSTEM_ADMIN', 'system_admin', 'admin', 'administrador',
    'INSTITUTION_MANAGER', 'institution_manager', 'gestor', 'manager',
    'ACADEMIC_COORDINATOR', 'academic_coordinator', 'coordenador',
    'TEACHER', 'teacher', 'professor',
    'STUDENT', 'student', 'aluno',
    'GUARDIAN', 'guardian', 'responsável'
  ];
  
  console.log('🧪 Testando permissões de notificação:');
  testRoles.forEach(role => {
    const canSend = canSendNotifications(role);
    const canAccess = canAccessAdvancedNotifications(role);
    const notifiableRoles = getNotifiableRoles(role);
    
    console.log(`  ${role}:`);
    console.log(`    Pode enviar: ${canSend ? '✅' : '❌'}`);
    console.log(`    Acesso avançado: ${canAccess ? '✅' : '❌'}`);
    console.log(`    Pode notificar: [${notifiableRoles.join(', ')}]`);
    console.log('');
  });
}

/**
 * Função de teste para verificar o mapeamento de roles
 */
export function testRoleMapping() {
  const testRoles = ['SYSTEM_ADMIN', 'TEACHER', 'STUDENT', 'GUARDIAN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR'];
  
  console.log('🧪 Testando mapeamento de roles:');
  testRoles.forEach(role => {
    const dashboard = getDashboardPath(role);
    const normalized = convertBackendRole(role);
    const valid = isValidRole(role);
    
    console.log(`  ${role}:`);
    console.log(`    Dashboard: ${dashboard}`);
    console.log(`    Normalizada: ${normalized}`);
    console.log(`    Válida: ${valid}`);
    console.log('');
  });
}

/**
 * Verifica se o usuário tem permissão para enviar notificações
 * Todos os níveis podem enviar exceto GUARDIAN e STUDENT
 * @param role - Role do usuário
 * @returns true se pode enviar notificações
 */
export function canSendNotifications(role: string | undefined | null): boolean {
  if (!role) {
    console.log('❌ canSendNotifications: role é null/undefined');
    return false;
  }

  console.log(`🔍 canSendNotifications: verificando permissão para role "${role}"`);

  // Normalizar a role para verificação consistente
  const normalizedRole = normalizeRole(role) || role.toLowerCase();
  
  // Roles que NÃO podem enviar notificações
  const restrictedRoles = [
    'student', 'aluno', 'estudante',
    'guardian', 'responsável', 'pai', 'mãe'
  ];
  
  // Verificar se é uma role restrita (busca em diferentes formatos)
  const isRestricted = restrictedRoles.some(restricted => {
    return normalizedRole === restricted || 
           role.toLowerCase() === restricted ||
           role.toLowerCase().includes(restricted) ||
           restricted.includes(role.toLowerCase());
  });

  if (isRestricted) {
    console.log(`❌ canSendNotifications: role "${role}" não pode enviar notificações (restrita)`);
    return false;
  }

  // Se não é restrita, pode enviar
  console.log(`✅ canSendNotifications: role "${role}" pode enviar notificações`);
  return true;
}

/**
 * Verifica se o usuário pode acessar funcionalidades de notificações avançadas
 * (envio, histórico, configurações avançadas)
 * @param role - Role do usuário
 * @returns true se pode acessar funcionalidades avançadas
 */
export function canAccessAdvancedNotifications(role: string | undefined | null): boolean {
  return canSendNotifications(role);
}

/**
 * Obtém a lista de roles que um usuário pode notificar baseado em sua própria role
 * @param userRole - Role do usuário atual
 * @returns Array de roles que podem ser notificadas
 */
export function getNotifiableRoles(userRole: string | undefined | null): string[] {
  if (!userRole || !canSendNotifications(userRole)) {
    return [];
  }

  const normalizedRole = normalizeRole(userRole) || userRole.toLowerCase();
  
  // SYSTEM_ADMIN pode notificar todos (exceto outros admins)
  if (normalizedRole === 'system_admin' || userRole.toLowerCase().includes('admin')) {
    return [
      'institution_manager', 'gestor', 'manager',
      'academic_coordinator', 'coordenador',
      'teacher', 'professor',
      'student', 'aluno',
      'guardian', 'responsável'
    ];
  }
  
  // INSTITUTION_MANAGER pode notificar coordenadores, professores, alunos e responsáveis
  if (normalizedRole === 'institution_manager' || userRole.toLowerCase().includes('gestor')) {
    return [
      'academic_coordinator', 'coordenador',
      'teacher', 'professor',
      'student', 'aluno',
      'guardian', 'responsável'
    ];
  }
  
  // ACADEMIC_COORDINATOR pode notificar professores, alunos e responsáveis
  if (normalizedRole === 'academic_coordinator' || userRole.toLowerCase().includes('coordenador')) {
    return [
      'teacher', 'professor',
      'student', 'aluno',
      'guardian', 'responsável'
    ];
  }
  
  // TEACHER pode notificar alunos e responsáveis
  if (normalizedRole === 'teacher' || userRole.toLowerCase().includes('professor')) {
    return [
      'student', 'aluno',
      'guardian', 'responsável'
    ];
  }
  
  // Outras roles podem notificar apenas alunos
  return ['student', 'aluno'];
}

/**
 * Verifica se o usuário pode notificar uma role específica
 * @param userRole - Role do usuário que quer enviar
 * @param targetRole - Role do destinatário
 * @returns true se pode notificar a role alvo
 */
export function canNotifyRole(userRole: string | undefined | null, targetRole: string): boolean {
  const notifiableRoles = getNotifiableRoles(userRole);
  const normalizedTarget = normalizeRole(targetRole) || targetRole.toLowerCase();
  
  return notifiableRoles.some(role => {
    const normalizedNotifiable = normalizeRole(role) || role.toLowerCase();
    return normalizedNotifiable === normalizedTarget || 
           role.toLowerCase() === targetRole.toLowerCase() ||
           targetRole.toLowerCase().includes(normalizedNotifiable) ||
           normalizedNotifiable.includes(targetRole.toLowerCase());
  });
}