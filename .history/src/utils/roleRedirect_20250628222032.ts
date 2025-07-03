import { UserRole } from '../types/roles';

/**
 * Mapeia roles de usuário para seus respectivos dashboards
 */
export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  // Roles em uppercase (padrão do sistema)
  'STUDENT': '/dashboard/student',
  'TEACHER': '/dashboard/teacher',
  'ADMIN': '/dashboard/system-admin',
  'SYSTEM_ADMIN': '/dashboard/system-admin',
  'INSTITUTION_MANAGER': '/dashboard/institution-manager',
  'COORDINATOR': '/dashboard/coordinator',
  'GUARDIAN': '/dashboard/guardian',
  'MANAGER': '/dashboard/institution-manager',
  
  // Compatibilidade com versões anteriores
  'student': '/dashboard/student',
  'teacher': '/dashboard/teacher',
  'admin': '/dashboard/system-admin',
  'manager': '/dashboard/institution-manager',
  'system_admin': '/dashboard/system-admin',
  'institution_manager': '/dashboard/institution-manager',
  'academic_coordinator': '/dashboard/coordinator',
  'coordinator': '/dashboard/coordinator',
  'guardian': '/dashboard/guardian',
  
  // Roles em português (vindas do backend)
  'aluno': '/dashboard/student',
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
};

/**
 * Obtém o caminho do dashboard baseado na role do usuário
 * @param role - Role do usuário
 * @returns Caminho do dashboard ou null se role inválida
 */
export function getDashboardPath(role: string): string | null {
  if (!role) return null;
  
  // Tenta obter o dashboard diretamente com a role original
  let dashboard = ROLE_DASHBOARD_MAP[role];
  
  // Se não encontrar, tenta com a versão em uppercase
  if (!dashboard) {
    dashboard = ROLE_DASHBOARD_MAP[role.toUpperCase()];
  }
  
  return dashboard || null;
}

/**
 * Verifica se uma role é válida
 * @param role - Role a ser verificada
 * @returns true se a role é válida
 */
export function isValidRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return role in ROLE_DASHBOARD_MAP || role.toUpperCase() in ROLE_DASHBOARD_MAP;
}

/**
 * Obtém todas as roles disponíveis
 * @returns Array com todas as roles válidas
 */
export function getAvailableRoles(): string[] {
  return Object.keys(ROLE_DASHBOARD_MAP);
}