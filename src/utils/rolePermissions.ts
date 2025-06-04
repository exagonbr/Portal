import { UserRole, ROLE_BASED_ROUTES, canAccessRoute as checkAccessRoute } from '@/types/roles';

// Definir as permissões para cada papel
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.SYSTEM_ADMIN]: [
    // Permissões do Sistema
    'system.manage',
    'system.monitor',
    'system.configure',
    'system.backup',
    'system.restore',
    
    // Gestão de Usuários
    'users.manage.all',
    'users.create',
    'users.edit',
    'users.delete',
    'users.view.all',
    
    // Gestão de Instituições
    'institutions.manage.all',
    'institutions.create',
    'institutions.edit',
    'institutions.delete',
    'institutions.view.all',
    
    // Gestão de Permissões
    'roles.manage',
    'permissions.manage',
    'permissions.view',
    'permissions.assign',
    'permissions.revoke',
    
    // Monitoramento e Segurança
    'monitoring.view',
    'security.manage',
    'audit.view',
    'logs.view.all',
    'performance.view.all',
    
    // Permissão Universal
    'all.permissions'
  ],
  
  [UserRole.INSTITUTION_MANAGER]: [
    // Gestão Institucional
    'institution.manage',
    'institution.view',
    'institution.edit',
    
    // Gestão de Escolas
    'schools.manage',
    'schools.create',
    'schools.edit',
    'schools.delete',
    'schools.view',
    
    // Gestão de Turmas
    'classes.manage',
    'classes.create',
    'classes.edit',
    'classes.delete',
    'classes.view',
    
    // Gestão de Professores
    'teachers.manage',
    'teachers.create',
    'teachers.edit',
    'teachers.delete',
    'teachers.view',
    
    // Gestão de Alunos
    'students.manage',
    'students.create',
    'students.edit',
    'students.delete',
    'students.view',
    
    // Gestão Acadêmica
    'courses.manage',
    'curriculum.manage',
    'schedules.manage',
    
    // Relatórios e Financeiro
    'reports.institutional',
    'reports.academic',
    'reports.financial',
    'financial.view',
    'financial.manage'
  ],
  
  [UserRole.ACADEMIC_COORDINATOR]: [
    // Gestão Acadêmica
    'cycles.manage',
    'curriculum.manage',
    'courses.view',
    'courses.evaluate',
    
    // Gestão de Professores
    'teachers.evaluate',
    'teachers.monitor',
    'teachers.schedule',
    
    // Gestão de Alunos
    'students.monitor',
    'students.evaluate',
    'students.performance',
    
    // Planejamento e Avaliação
    'performance.analyze',
    'planning.manage',
    'evaluations.manage',
    'indicators.view',
    
    // Comunicação
    'meetings.schedule',
    'meetings.manage',
    'announcements.manage',
    
    // Relatórios
    'reports.academic',
    'reports.performance',
    'reports.attendance'
  ],
  
  [UserRole.TEACHER]: [
    // Gestão de Aulas
    'classes.teach',
    'classes.manage',
    'classes.schedule',
    
    // Gestão de Alunos
    'students.evaluate',
    'students.view',
    'students.contact',
    
    // Gestão de Atividades
    'assignments.manage',
    'assignments.create',
    'assignments.evaluate',
    
    // Gestão de Notas
    'grades.manage',
    'grades.input',
    'grades.view',
    
    // Gestão de Materiais
    'materials.upload',
    'materials.manage',
    'materials.view',
    
    // Comunicação
    'messages.send',
    'messages.receive',
    'forum.moderate',
    
    // Relatórios
    'reports.class',
    'reports.performance',
    'reports.attendance'
  ],
  
  [UserRole.STUDENT]: [
    // Acesso aos Cursos
    'courses.view',
    'courses.enroll',
    'courses.participate',
    
    // Atividades
    'assignments.submit',
    'assignments.view',
    'assignments.evaluate',
    
    // Notas e Avaliações
    'grades.view',
    'grades.own',
    
    // Materiais
    'materials.access',
    'materials.download',
    
    // Comunicação
    'messages.send',
    'messages.receive',
    'forum.participate',
    
    // Atividades Extras
    'activities.participate',
    'activities.view',
    
    // Perfil
    'profile.view',
    'profile.edit'
  ],
  
  [UserRole.GUARDIAN]: [
    // Monitoramento de Dependentes
    'children.monitor',
    'children.view',
    'children.contact',
    
    // Acompanhamento Acadêmico
    'grades.view',
    'attendance.view',
    'activities.view',
    'assignments.view',
    
    // Comunicação
    'messages.send',
    'messages.receive',
    'meetings.schedule',
    'meetings.view',
    
    // Financeiro
    'payments.manage',
    'payments.view',
    'invoices.view',
    'invoices.download',
    
    // Relatórios
    'reports.student',
    'reports.performance',
    'reports.attendance',
    
    // Perfil
    'profile.view',
    'profile.edit'
  ]
};

// Mapeamento entre permissões e rotas permitidas
const permissionRouteMap: Record<string, string[]> = {
  // Permissões universais
  'all.permissions': ['*'],
  
  // Permissões de admin
  'system.manage': ['/dashboard/system-admin', '/system/*', '/admin/*'],
  'system.monitor': ['/dashboard/system-admin', '/system/*'],
  'system.configure': ['/dashboard/system-admin', '/system/settings/*'],
  
  // Permissões de gestão institucional
  'institution.manage': ['/dashboard/institution-manager', '/institution/*'],
  'schools.manage': ['/dashboard/institution-manager', '/schools/*'],
  
  // Permissões acadêmicas
  'cycles.manage': ['/dashboard/coordinator', '/cycles/*'],
  'curriculum.manage': ['/dashboard/coordinator', '/curriculum/*'],
  
  // Permissões de professores
  'classes.teach': ['/dashboard/teacher', '/attendance/*', '/grades/*'],
  
  // Permissões de estudantes
  'courses.view': ['/dashboard/student', '/my-courses/*'],
  'grades.own': ['/dashboard/student', '/my-grades/*'],
  
  // Permissões de responsáveis
  'children.monitor': ['/dashboard/guardian', '/children/*']
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
  // Primeiro, verificamos usando a função definida em types/roles.ts
  if (checkAccessRoute(role, route)) {
    return true;
  }
  
  // Se a verificação do ROLE_BASED_ROUTES falhar, verificamos usando permissões
  const permissions = rolePermissions[role] || [];
  
  // System Admin sempre tem acesso
  if (role === UserRole.SYSTEM_ADMIN) {
    return true;
  }
  
  // Verifica permissões universais
  if (permissions.includes('all.permissions')) {
    return true;
  }
  
  // Verifica permissões específicas
  for (const permission of permissions) {
    const allowedRoutes = permissionRouteMap[permission] || [];
    
    if (allowedRoutes.includes('*')) {
      return true;
    }
    
    for (const allowedRoute of allowedRoutes) {
      // Verifica rota exata
      if (allowedRoute === route) {
        return true;
      }
      
      // Verifica wildcard (ex: /system/*)
      if (allowedRoute.endsWith('/*')) {
        const prefix = allowedRoute.slice(0, -1); // Remove o * do final
        if (route.startsWith(prefix)) {
          return true;
        }
      }
    }
  }
  
  return false;
}

// Função para obter o dashboard padrão baseado no papel
export function getDefaultDashboard(role: UserRole): string {
  // Obter a rota do dashboard principal para cada papel a partir das rotas definidas
  const dashboardRoute = ROLE_BASED_ROUTES.find(route => 
    route.path.startsWith('/dashboard/') && 
    route.roles.includes(role)
  );
  
  return dashboardRoute?.path || '/dashboard';
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