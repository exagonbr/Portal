import { UserRole } from '../types/roles';

/**
 * Mapeia roles de usuário para seus respectivos dashboards
 * Inclui tanto roles em português (do backend) quanto em inglês (frontend)
 */
export const ROLE_DASHBOARD_MAP: Record<string, string> = {
<<<<<<< HEAD
  // Roles em uppercase (padrão do sistema) - CORRIGIDO para usar caminhos reais do Next.js
  'STUDENT': '/dashboard/student',
  'TEACHER': '/dashboard/teacher',
  'ADMIN': '/dashboard/system-admin',
  'SYSTEM_ADMIN': '/dashboard/system-admin',
  'INSTITUTION_MANAGER': '/dashboard/institution-manager',
  'COORDINATOR': '/dashboard/coordinator',
  'GUARDIAN': '/dashboard/guardian',
  'MANAGER': '/dashboard/institution-manager',
  
  // Roles em lowercase (para compatibilidade com AuthContext que normaliza para lowercase)
  'student': '/dashboard/student',
  'teacher': '/dashboard/teacher',
  'admin': '/dashboard/system-admin',
  'system_admin': '/dashboard/system-admin', // IMPORTANTE: Esta é a chave que o AuthContext usa
  'system-admin': '/dashboard/system-admin', // IMPORTANTE: Para compatibilidade com role_slug do backend
  'institution_manager': '/dashboard/institution-manager',
=======
  // Roles em inglês (padrão do sistema)
  'student': '/dashboard/student',
  'teacher': '/dashboard/teacher',
  'admin': '/dashboard/system-admin',
  'manager': '/dashboard/institution-manager',
  'system_admin': '/dashboard/system-admin',
  'institution_manager': '/dashboard/institution-manager',
  'academic_coordinator': '/dashboard/coordinator',
>>>>>>> master
  'coordinator': '/dashboard/coordinator',
  'guardian': '/dashboard/guardian',
  'manager': '/dashboard/institution-manager',
  'academic_coordinator': '/dashboard/coordinator',
  
  // Roles em português (vindas do backend) - lowercase
  'aluno': '/dashboard/student',
<<<<<<< HEAD
  'Aluno': '/dashboard/student',
  'ALUNO': '/dashboard/student',
  'professor': '/dashboard/teacher',
  'Professor': '/dashboard/teacher',
  'PROFESSOR': '/dashboard/teacher',
  'administrador': '/dashboard/system-admin',
  'Administrador': '/dashboard/system-admin',
  'ADMINISTRADOR': '/dashboard/system-admin',
  'administrador do sistema': '/dashboard/system-admin',
  'Administrador do Sistema': '/dashboard/system-admin',
  'ADMINISTRADOR DO SISTEMA': '/dashboard/system-admin',
  'gestor': '/dashboard/institution-manager',
  'Gestor': '/dashboard/institution-manager',
  'GESTOR': '/dashboard/institution-manager',
  'gestor institucional': '/dashboard/institution-manager',
  'Gestor Institucional': '/dashboard/institution-manager',
  'GESTOR INSTITUCIONAL': '/dashboard/institution-manager',
  'coordenador acadêmico': '/dashboard/coordinator',
  'Coordenador Acadêmico': '/dashboard/coordinator',
  'COORDENADOR ACADÊMICO': '/dashboard/coordinator',
  'responsável': '/dashboard/guardian',
  'Responsável': '/dashboard/guardian',
  'RESPONSÁVEL': '/dashboard/guardian'
=======
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
>>>>>>> master
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
<<<<<<< HEAD
export function getDashboardPath(role: string): string | null {
  if (!role) return null;
  
  console.log(`🔍 [getDashboardPath] Procurando dashboard para role: "${role}"`);
  
  // Tenta obter o dashboard diretamente com a role original
  let dashboard = ROLE_DASHBOARD_MAP[role];
  console.log(`🔍 [getDashboardPath] Tentativa 1 (original): ${dashboard}`);
  
  // Se não encontrar, tenta com a versão em uppercase
  if (!dashboard) {
    dashboard = ROLE_DASHBOARD_MAP[role.toUpperCase()];
    console.log(`🔍 [getDashboardPath] Tentativa 2 (uppercase): ${dashboard}`);
  }
  
  // Se ainda não encontrar, tenta com a versão em lowercase
  if (!dashboard) {
    dashboard = ROLE_DASHBOARD_MAP[role.toLowerCase()];
    console.log(`🔍 [getDashboardPath] Tentativa 3 (lowercase): ${dashboard}`);
  }
  
  // Para SYSTEM_ADMIN especificamente, garantir que funcione
  if (!dashboard && (role.toUpperCase() === 'SYSTEM_ADMIN' || role.toLowerCase() === 'system_admin')) {
    dashboard = '/dashboard/system-admin';
    console.log(`🔍 [getDashboardPath] Fallback para SYSTEM_ADMIN: ${dashboard}`);
  }
  
  console.log(`🎯 [getDashboardPath] Dashboard final para "${role}": ${dashboard}`);
  return dashboard || null;
=======
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
>>>>>>> master
}

/**
 * Verifica se uma role é válida
 * @param role - Role a ser verificada
 * @returns true se a role é válida
 */
export function isValidRole(role: string | undefined | null): boolean {
  if (!role) return false;
<<<<<<< HEAD
  return role in ROLE_DASHBOARD_MAP || role.toUpperCase() in ROLE_DASHBOARD_MAP;
=======
  
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
>>>>>>> master
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