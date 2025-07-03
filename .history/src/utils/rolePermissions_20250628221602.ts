import { UserRole } from '@/types/roles';

// Definir as permissões para cada papel
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.SYSTEM_ADMIN]: [
    'system.manage',
    'users.manage',
    'institutions.manage',
    'roles.manage',
    'monitoring.view',
    'security.manage',
    'backup.manage',
    'audit.view',
    'all.permissions'
  ],
  [UserRole.INSTITUTION_MANAGER]: [
    'institution.manage',
    'schools.manage',
    'classes.manage',
    'teachers.manage',
    'students.manage',
    'courses.manage',
    'curriculum.manage',
    'reports.institutional',
    'financial.view'
  ],
  [UserRole.COORDINATOR]: [
    'cycles.manage',
    'curriculum.manage',
    'teachers.evaluate',
    'students.monitor',
    'performance.analyze',
    'planning.manage',
    'meetings.schedule',
    'indicators.view',
    'reports.academic'
  ],
  [UserRole.TEACHER]: [
    'classes.teach',
    'students.evaluate',
    'assignments.manage',
    'grades.manage',
    'attendance.record',
    'materials.upload',
    'messages.send',
    'reports.class'
  ],
  [UserRole.STUDENT]: [
    'courses.view',
    'assignments.submit',
    'grades.view',
    'materials.access',
    'messages.send',
    'forum.participate',
    'activities.participate'
  ],
  [UserRole.GUARDIAN]: [
    'children.monitor',
    'grades.view',
    'attendance.view',
    'activities.view',
    'messages.send',
    'meetings.schedule',
    'payments.manage',
    'reports.student'
  ]
};

// Função para verificar se um papel tem uma permissão específica
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role] || [];
  
  // System Admin tem todas as permissões
  if (role === UserRole.SYSTEM_ADMIN || permissions.includes('all.permissions')) {
    return true;
  }
  
  return permissions.includes(permission);
}

// Função para verificar se um papel pode acessar uma rota
export function canAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, string[]> = {
    '/dashboard/system-admin': ['system.manage'],
    '/dashboard/institution-manager': ['institution.manage'],
    '/dashboard/coordinator': ['cycles.manage'],
    '/dashboard/teacher': ['classes.teach'],
    '/dashboard/student': ['courses.view'],
    '/dashboard/guardian': ['children.monitor'],
    '/admin': ['system.manage', 'institution.manage'],
    '/institution': ['institution.manage', 'cycles.manage'],
    '/coordinator': ['cycles.manage'],
    '/teacher': ['classes.teach'],
    '/guardian': ['children.monitor'],
    '/forum': ['forum.participate'],
    '/chat': ['messages.send']
  };

  const requiredPermissions = routePermissions[route] || [];
  
  // Se não há permissões requeridas, permite acesso
  if (requiredPermissions.length === 0) {
    return true;
  }
  
  // Verifica se o papel tem pelo menos uma das permissões requeridas
  return requiredPermissions.some(permission => hasPermission(role, permission));
}

// Função para obter o dashboard padrão baseado no papel
export function getDefaultDashboard(role: UserRole): string {
  const dashboardRoutes: Record<UserRole, string> = {
    [UserRole.SYSTEM_ADMIN]: '/dashboard/system-admin',
    [UserRole.INSTITUTION_MANAGER]: '/dashboard/institution-manager',
    [UserRole.ACADEMIC_COORDINATOR]: '/dashboard/coordinator',
    [UserRole.TEACHER]: '/dashboard/teacher',
    [UserRole.STUDENT]: '/dashboard/student',
    [UserRole.GUARDIAN]: '/dashboard/guardian'
  };
  
  return dashboardRoutes[role] || '/dashboard';
}

// Função para obter o nome do papel em português
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.SYSTEM_ADMIN]: 'Administrador do Sistema',
    [UserRole.INSTITUTION_MANAGER]: 'Gestor Institucional',
    [UserRole.ACADEMIC_COORDINATOR]: 'Coordenador Acadêmico',
    [UserRole.TEACHER]: 'Professor',
    [UserRole.STUDENT]: 'Estudante',
    [UserRole.GUARDIAN]: 'Responsável'
  };
  
  return roleNames[role] || role;
}

// Função para obter a cor do papel
export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    [UserRole.SYSTEM_ADMIN]: 'bg-red-500',
    [UserRole.INSTITUTION_MANAGER]: 'bg-purple-500',
    [UserRole.ACADEMIC_COORDINATOR]: 'bg-blue-500',
    [UserRole.TEACHER]: 'bg-green-500',
    [UserRole.STUDENT]: 'bg-yellow-500',
    [UserRole.GUARDIAN]: 'bg-indigo-500'
  };
  
  return roleColors[role] || 'bg-gray-500';
}