import { UserRole } from '../types/auth';

/**
 * Mapeia roles de usuário para seus respectivos dashboards
 * Inclui tanto roles em português (do backend) quanto em inglês (frontend)
 */
export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  // Roles em inglês (padrão do sistema)
  'student': '/dashboard/student',
  'teacher': '/dashboard/teacher',
  'admin': '/dashboard/admin',
  'manager': '/dashboard/manager',
  'system_admin': '/dashboard/admin',
  'institution_manager': '/dashboard/institution-manager',
  'academic_coordinator': '/dashboard/coordinator',
  'guardian': '/dashboard/guardian',
  
  // Roles em português (vindas do backend) - lowercase
  'aluno': '/dashboard/student',
  'professor': '/dashboard/teacher',
  'administrador': '/dashboard/admin',
  'gestor': '/dashboard/manager',
  'coordenador acadêmico': '/dashboard/coordinator',
  'responsável': '/dashboard/guardian',
  
  // Roles em português com primeira letra maiúscula
  'Aluno': '/dashboard/student',
  'Professor': '/dashboard/teacher',
  'Administrador': '/dashboard/admin',
  'Gestor': '/dashboard/manager',
  'Coordenador Acadêmico': '/dashboard/coordinator',
  'Responsável': '/dashboard/guardian',
  
  // Variações em maiúsculas
  'ALUNO': '/dashboard/student',
  'PROFESSOR': '/dashboard/teacher',
  'ADMINISTRADOR': '/dashboard/admin',
  'GESTOR': '/dashboard/manager',
  'COORDENADOR ACADÊMICO': '/dashboard/coordinator',
  'RESPONSÁVEL': '/dashboard/guardian',
  
  // Roles do enum UserRole
  'STUDENT': '/dashboard/student',
  'TEACHER': '/dashboard/teacher',
  'SYSTEM_ADMIN': '/dashboard/admin',
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
    'administrador': 'admin',
    'admin': 'admin',
    'gestor': 'manager',
    'gerente': 'manager',
    'coordenador acadêmico': 'academic_coordinator',
    'coordenador': 'academic_coordinator',
    'responsável': 'guardian',
    'pai': 'guardian',
    'mãe': 'guardian',
    'system_admin': 'admin',
    'institution_manager': 'manager'
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
    return null;
  }

  // Primeiro tenta buscar exatamente como recebido
  let dashboardPath = ROLE_DASHBOARD_MAP[role];
  
  if (dashboardPath) {
    return dashboardPath;
  }

  // Se não encontrou, tenta normalizar
  const normalizedRole = normalizeRole(role);
  if (normalizedRole) {
    dashboardPath = ROLE_DASHBOARD_MAP[normalizedRole];
    
    if (dashboardPath) {
      return dashboardPath;
    }
  }

  // Se ainda não encontrou, tenta buscar por lowercase da role original
  const lowercaseRole = role.toLowerCase();
  dashboardPath = ROLE_DASHBOARD_MAP[lowercaseRole];
  
  if (dashboardPath) {
    return dashboardPath;
  }
  
  return null;
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
  
  const normalized = normalizeRole(backendRole);
  return normalized || backendRole.toLowerCase();
}