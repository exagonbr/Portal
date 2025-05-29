import { UserRole } from '../types/auth';

/**
 * Mapeia roles de usuário para seus respectivos dashboards
 */
export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  // Roles em inglês (mantidas para compatibilidade)
  'student': '/dashboard/student',
  'teacher': '/dashboard/teacher',
  'admin': '/dashboard/admin',
  'manager': '/dashboard/manager',
  'system_admin': '/dashboard/system-admin',
  'institution_manager': '/dashboard/institution-manager',
  'academic_coordinator': '/dashboard/coordinator',
  'guardian': '/dashboard/guardian',
  
  // Roles em português (vindas do backend)
  'aluno': '/dashboard/student',
  'Aluno': '/dashboard/student', // Adicionando versão com maiúscula
  'professor': '/dashboard/teacher',
  'Professor': '/dashboard/teacher', // Adicionando versão com maiúscula
  'administrador': '/dashboard/admin',
  'Administrador': '/dashboard/admin', // Adicionando versão com maiúscula
  'gestor': '/dashboard/manager',
  'Gestor': '/dashboard/manager', // Adicionando versão com maiúscula
  'coordenador acadêmico': '/dashboard/coordinator',
  'Coordenador Acadêmico': '/dashboard/coordinator', // Adicionando versão com maiúscula
  'responsável': '/dashboard/guardian',
  'Responsável': '/dashboard/guardian' // Adicionando versão com maiúscula
};

/**
 * Obtém o caminho do dashboard baseado na role do usuário
 * @param role - Role do usuário
 * @returns Caminho do dashboard ou null se role inválida
 */
export function getDashboardPath(role: string): string | null {
  return ROLE_DASHBOARD_MAP[role] || null;
}

/**
 * Verifica se uma role é válida
 * @param role - Role a ser verificada
 * @returns true se a role é válida
 */
export function isValidRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return role in ROLE_DASHBOARD_MAP;
}

/**
 * Obtém todas as roles disponíveis
 * @returns Array com todas as roles válidas
 */
export function getAvailableRoles(): string[] {
  return Object.keys(ROLE_DASHBOARD_MAP);
}