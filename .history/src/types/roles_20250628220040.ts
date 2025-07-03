export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  INSTITUTION_MANAGER = 'INSTITUTION_MANAGER', 
  COORDINATOR = 'COORDINATOR',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN'
}

export interface RolePermissions {
  // System Management
  canManageSystem: boolean;
  canManageInstitutions: boolean;
  canManageGlobalUsers: boolean;
  canViewSystemAnalytics: boolean;
  canManageSecurityPolicies: boolean;
  canViewPortalReports:boolean;
  
  // Institution Management
  canManageSchools: boolean;
  canManageInstitutionUsers: boolean;
  canManageClasses: boolean;
  canManageSchedules: boolean;
  canViewInstitutionAnalytics: boolean;
  
  // Academic Management
  canManageCycles: boolean;
  canManageCurriculum: boolean;
  canMonitorTeachers: boolean;
  canViewAcademicAnalytics: boolean;
  canCoordinateDepartments: boolean;
  
  // Teaching
  canManageAttendance: boolean;
  canManageGrades: boolean;
  canManageLessonPlans: boolean;
  canUploadResources: boolean;
  canCommunicateWithStudents: boolean;
  canCommunicateWithGuardians: boolean;
  
  // Student Access
  canViewOwnSchedule: boolean;
  canViewOwnGrades: boolean;
  canAccessLearningMaterials: boolean;
  canSubmitAssignments: boolean;
  canTrackOwnProgress: boolean;
  canMessageTeachers: boolean;
  
  // Guardian Access
  canViewChildrenInfo: boolean;
  canViewChildrenGrades: boolean;
  canViewChildrenAttendance: boolean;
  canViewChildrenAssignments: boolean;
  canReceiveAnnouncements: boolean;
  canCommunicateWithSchool: boolean;
  canScheduleMeetings: boolean;
  
  // Financial Access
  canViewFinancialInfo: boolean;
  canViewPayments: boolean;
  canViewBoletos: boolean;
  canViewFinancialHistory: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.SYSTEM_ADMIN]: {
    // System Management - ACESSO COMPLETO
    canManageSystem: true,
    canManageInstitutions: true,
    canManageGlobalUsers: true,
    canViewSystemAnalytics: true,
    canManageSecurityPolicies: true,
    canViewPortalReports:true,
    
    // Institution Management - ACESSO COMPLETO (para supervisionar)
    canManageSchools: true,
    canManageInstitutionUsers: true,
    canManageClasses: true,
    canManageSchedules: true,
    canViewInstitutionAnalytics: true,
    
    // Academic Management - ACESSO COMPLETO (para supervisionar)
    canManageCycles: true,
    canManageCurriculum: true,
    canMonitorTeachers: true,
    canViewAcademicAnalytics: true,
    canCoordinateDepartments: true,
    
    // Teaching - ACESSO PARA SUPERVISÃO E SUPORTE
    canManageAttendance: true,
    canManageGrades: true,
    canManageLessonPlans: true,
    canUploadResources: true,
    canCommunicateWithStudents: true,
    canCommunicateWithGuardians: true,
    
    // Student Access - ACESSO PARA DEBUG E SUPORTE
    canViewOwnSchedule: true,
    canViewOwnGrades: true,
    canAccessLearningMaterials: true,
    canSubmitAssignments: true,
    canTrackOwnProgress: true,
    canMessageTeachers: true,
    
    // Guardian Access - ACESSO PARA SUPORTE
    canViewChildrenInfo: true,
    canViewChildrenGrades: true,
    canViewChildrenAttendance: true,
    canViewChildrenAssignments: true,
    canReceiveAnnouncements: true,
    canCommunicateWithSchool: true,
    canScheduleMeetings: true,
    
    // Financial Access - ACESSO PARA SUPORTE
    canViewFinancialInfo: true,
    canViewPayments: true,
    canViewBoletos: true,
    canViewFinancialHistory: true
  },
  [UserRole.INSTITUTION_MANAGER]: {
    canManageSystem: false,
    canManageInstitutions: false,
    canManageGlobalUsers: false,
    canViewSystemAnalytics: false,
    canViewPortalReports:true,
    canManageSecurityPolicies: false,
    canManageSchools: true,
    canManageInstitutionUsers: true,
    canManageClasses: true,
    canManageSchedules: true,
    canViewInstitutionAnalytics: true,
    canManageCycles: true,
    canManageCurriculum: true,
    canMonitorTeachers: true,
    canViewAcademicAnalytics: true,
    canCoordinateDepartments: true,
    canManageAttendance: false,
    canManageGrades: false,
    canManageLessonPlans: false,
    canUploadResources: false,
    canCommunicateWithStudents: true,
    canCommunicateWithGuardians: true,
    canViewOwnSchedule: false,
    canViewOwnGrades: false,
    canAccessLearningMaterials: false,
    canSubmitAssignments: false,
    canTrackOwnProgress: false,
    canMessageTeachers: false,
    canViewChildrenInfo: false,
    canViewChildrenGrades: false,
    canViewChildrenAttendance: false,
    canViewChildrenAssignments: false,
    canReceiveAnnouncements: true,
    canCommunicateWithSchool: false,
    canScheduleMeetings: false,
    canViewFinancialInfo: false,
    canViewPayments: false,
    canViewBoletos: false,
    canViewFinancialHistory: false
  },
  [UserRole.COORDINATOR]: {
    canManageSystem: false,
    canManageInstitutions: false,
    canManageGlobalUsers: false,
    canViewSystemAnalytics: false,
    canViewPortalReports:true,
    canManageSecurityPolicies: false,
    canManageSchools: false,
    canManageInstitutionUsers: false,
    canManageClasses: true,
    canManageSchedules: true,
    canViewInstitutionAnalytics: true,
    canManageCycles: true,
    canManageCurriculum: true,
    canMonitorTeachers: true,
    canViewAcademicAnalytics: true,
    canCoordinateDepartments: true,
    canManageAttendance: false,
    canManageGrades: false,
    canManageLessonPlans: false,
    canUploadResources: true,
    canCommunicateWithStudents: true,
    canCommunicateWithGuardians: true,
    canViewOwnSchedule: false,
    canViewOwnGrades: false,
    canAccessLearningMaterials: false,
    canSubmitAssignments: false,
    canTrackOwnProgress: false,
    canMessageTeachers: true,
    canViewChildrenInfo: false,
    canViewChildrenGrades: false,
    canViewChildrenAttendance: false,
    canViewChildrenAssignments: false,
    canReceiveAnnouncements: true,
    canCommunicateWithSchool: false,
    canScheduleMeetings: false,
    canViewFinancialInfo: false,
    canViewPayments: false,
    canViewBoletos: false,
    canViewFinancialHistory: false
  },
  [UserRole.TEACHER]: {
    canManageSystem: false,
    canManageInstitutions: false,
    canManageGlobalUsers: false,
    canViewSystemAnalytics: false,
    canManageSecurityPolicies: false,
    canManageSchools: false,
    canViewPortalReports:true,
    canManageInstitutionUsers: false,
    canManageClasses: false,
    canManageSchedules: false,
    canViewInstitutionAnalytics: false,
    canManageCycles: false,
    canManageCurriculum: false,
    canMonitorTeachers: false,
    canViewAcademicAnalytics: false,
    canCoordinateDepartments: false,
    canManageAttendance: true,
    canManageGrades: true,
    canManageLessonPlans: true,
    canUploadResources: true,
    canCommunicateWithStudents: true,
    canCommunicateWithGuardians: true,
    canViewOwnSchedule: true,
    canViewOwnGrades: false,
    canAccessLearningMaterials: true,
    canSubmitAssignments: false,
    canTrackOwnProgress: false,
    canMessageTeachers: true,
    canViewChildrenInfo: false,
    canViewChildrenGrades: false,
    canViewChildrenAttendance: false,
    canViewChildrenAssignments: false,
    canReceiveAnnouncements: true,
    canCommunicateWithSchool: true,
    canScheduleMeetings: false,
    canViewFinancialInfo: false,
    canViewPayments: false,
    canViewBoletos: false,
    canViewFinancialHistory: false
  },
  [UserRole.STUDENT]: {
    canManageSystem: false,
    canManageInstitutions: false,
    canManageGlobalUsers: false,
    canViewPortalReports:false,
    canViewSystemAnalytics: false,
    canManageSecurityPolicies: false,
    canManageSchools: false,
    canManageInstitutionUsers: false,
    canManageClasses: false,
    canManageSchedules: false,
    canViewInstitutionAnalytics: false,
    canManageCycles: false,
    canManageCurriculum: false,
    canMonitorTeachers: false,
    canViewAcademicAnalytics: false,
    canCoordinateDepartments: false,
    canManageAttendance: false,
    canManageGrades: false,
    canManageLessonPlans: false,
    canUploadResources: false,
    canCommunicateWithStudents: true,
    canCommunicateWithGuardians: false,
    canViewOwnSchedule: true,
    canViewOwnGrades: true,
    canAccessLearningMaterials: true,
    canSubmitAssignments: true,
    canTrackOwnProgress: true,
    canMessageTeachers: true,
    canViewChildrenInfo: false,
    canViewChildrenGrades: false,
    canViewChildrenAttendance: false,
    canViewChildrenAssignments: false,
    canReceiveAnnouncements: true,
    canCommunicateWithSchool: false,
    canScheduleMeetings: false,
    canViewFinancialInfo: false,
    canViewPayments: false,
    canViewBoletos: false,
    canViewFinancialHistory: false
  },
  [UserRole.GUARDIAN]: {
    canManageSystem: false,
    canManageInstitutions: false,
    canManageGlobalUsers: false,
    canViewPortalReports:false,
    canViewSystemAnalytics: false,
    canManageSecurityPolicies: false,
    canManageSchools: false,
    canManageInstitutionUsers: false,
    canManageClasses: false,
    canManageSchedules: false,
    canViewInstitutionAnalytics: false,
    canManageCycles: false,
    canManageCurriculum: false,
    canMonitorTeachers: false,
    canViewAcademicAnalytics: false,
    canCoordinateDepartments: false,
    canManageAttendance: false,
    canManageGrades: false,
    canManageLessonPlans: false,
    canUploadResources: false,
    canCommunicateWithStudents: false,
    canCommunicateWithGuardians: false,
    canViewOwnSchedule: false,
    canViewOwnGrades: false,
    canAccessLearningMaterials: false,
    canSubmitAssignments: false,
    canTrackOwnProgress: false,
    canMessageTeachers: false,
    canViewChildrenInfo: true,
    canViewChildrenGrades: true,
    canViewChildrenAttendance: true,
    canViewChildrenAssignments: true,
    canReceiveAnnouncements: true,
    canCommunicateWithSchool: true,
    canScheduleMeetings: true,
    canViewFinancialInfo: true,
    canViewPayments: true,
    canViewBoletos: true,
    canViewFinancialHistory: true
  }
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: 'Administrador do Sistema',
  [UserRole.INSTITUTION_MANAGER]: 'Gestor de Instituição',
  [UserRole.ACADEMIC_COORDINATOR]: 'Coordenador Acadêmico',
  [UserRole.TEACHER]: 'Professor',
  [UserRole.STUDENT]: 'Estudante',
  [UserRole.GUARDIAN]: 'Responsável'
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: 'Supervisiona toda a infraestrutura da plataforma. Responsável por configurações do sistema, gerenciamento de permissões, integração de instituições, políticas de segurança e garantia da integridade e disponibilidade da plataforma.',
  [UserRole.INSTITUTION_MANAGER]: 'Gerencia as operações de uma escola ou unidade educacional específica. Possui acesso administrativo para gerenciar turmas, usuários, horários, análises de desempenho, conteúdo institucional e comunicações internas.',
  [UserRole.ACADEMIC_COORDINATOR]: 'Supervisiona ciclos educacionais específicos ou departamentos. Monitora o progresso acadêmico dos alunos, apoia o desenvolvimento dos professores, coordena a execução do currículo e analisa dados de desempenho.',
  [UserRole.TEACHER]: 'Acessa suas turmas designadas para gerenciar registros de presença, notas, planos de aula, recursos instrucionais e comunicação bidirecional com alunos e responsáveis.',
  [UserRole.STUDENT]: 'Tem acesso ao seu ambiente de aprendizagem personalizado, incluindo horários de aula, materiais de aprendizagem digital, avaliações, acompanhamento de progresso e mensagens com professores.',
  [UserRole.GUARDIAN]: 'Recebe insights detalhados sobre o desempenho acadêmico e comportamental dos alunos sob seus cuidados. Inclui acesso em tempo real a registros de presença, notas, comunicados escolares e comunicação direta com a equipe escolar.'
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: '#DC2626', // red-600
  [UserRole.INSTITUTION_MANAGER]: '#7C3AED', // violet-600
  [UserRole.ACADEMIC_COORDINATOR]: '#2563EB', // blue-600
  [UserRole.TEACHER]: '#059669', // emerald-600
  [UserRole.STUDENT]: '#F59E0B', // amber-600
  [UserRole.GUARDIAN]: '#8B5CF6' // purple-600
};

export interface RoleBasedRoute {
  path: string;
  roles: UserRole[];
  label: string;
  icon?: string;
}

export const ROLE_BASED_ROUTES: RoleBasedRoute[] = [
  // System Admin Routes
  {
    path: '/dashboard/system-admin',
    roles: [UserRole.SYSTEM_ADMIN],
    label: 'Painel do Sistema',
    icon: 'Settings'
  },
  {
    path: '/institutions',
    roles: [UserRole.SYSTEM_ADMIN],
    label: 'Gerenciar Instituições',
    icon: 'Building'
  },
  {
    path: '/system/users',
    roles: [UserRole.SYSTEM_ADMIN],
    label: 'Usuários Globais',
    icon: 'Users'
  },
  {
    path: '/system/security',
    roles: [UserRole.SYSTEM_ADMIN],
    label: 'Políticas de Segurança',
    icon: 'Shield'
  },
  
  // Institution Manager Routes
  {
    path: '/dashboard/institution-manager',
    roles: [UserRole.INSTITUTION_MANAGER],
    label: 'Painel Institucional',
    icon: 'Building'
  },
  {
    path: '/schools',
    roles: [UserRole.INSTITUTION_MANAGER],
    label: 'Gerenciar Escolas',
    icon: 'School'
  },
  {
    path: '/institution/analytics',
    roles: [UserRole.INSTITUTION_MANAGER, UserRole.ACADEMIC_COORDINATOR],
    label: 'Análises Institucionais',
    icon: 'BarChart'
  },
  
  // Academic Coordinator Routes
  {
    path: '/dashboard/coordinator',
    roles: [UserRole.ACADEMIC_COORDINATOR],
    label: 'Painel Acadêmico',
    icon: 'GraduationCap'
  },
  {
    path: '/cycles',
    roles: [UserRole.ACADEMIC_COORDINATOR, UserRole.INSTITUTION_MANAGER],
    label: 'Ciclos Educacionais',
    icon: 'Calendar'
  },
  {
    path: '/curriculum',
    roles: [UserRole.ACADEMIC_COORDINATOR],
    label: 'Currículo',
    icon: 'BookOpen'
  },
  
  // Teacher Routes
  {
    path: '/dashboard/teacher',
    roles: [UserRole.TEACHER],
    label: 'Painel do Professor',
    icon: 'Briefcase'
  },
  {
    path: '/attendance',
    roles: [UserRole.TEACHER],
    label: 'Registro de Presença',
    icon: 'UserCheck'
  },
  {
    path: '/grades',
    roles: [UserRole.TEACHER],
    label: 'Lançar Notas',
    icon: 'FileText'
  },
  
  // Student Routes
  {
    path: '/dashboard/student',
    roles: [UserRole.STUDENT],
    label: 'Meu Painel',
    icon: 'User'
  },
  {
    path: '/my-grades',
    roles: [UserRole.STUDENT],
    label: 'Minhas Notas',
    icon: 'Award'
  },
  {
    path: '/assignments',
    roles: [UserRole.STUDENT],
    label: 'Tarefas',
    icon: 'ClipboardList'
  },
  
  // Guardian Routes
  {
    path: '/dashboard/guardian',
    roles: [UserRole.GUARDIAN],
    label: 'Painel do Responsável',
    icon: 'Users'
  },
  {
    path: '/children',
    roles: [UserRole.GUARDIAN],
    label: 'Meus Dependentes',
    icon: 'UserPlus'
  },
  
  // Common Routes
  {
    path: '/chat',
    roles: [UserRole.TEACHER, UserRole.STUDENT, UserRole.GUARDIAN, UserRole.ACADEMIC_COORDINATOR, UserRole.INSTITUTION_MANAGER],
    label: 'Mensagens',
    icon: 'MessageSquare'
  },
  {
    path: '/forum',
    roles: [UserRole.TEACHER, UserRole.STUDENT, UserRole.ACADEMIC_COORDINATOR],
    label: 'Fórum',
    icon: 'MessageCircle'
  },
  {
    path: '/announcements',
    roles: [UserRole.TEACHER, UserRole.STUDENT, UserRole.GUARDIAN, UserRole.ACADEMIC_COORDINATOR, UserRole.INSTITUTION_MANAGER],
    label: 'Comunicados',
    icon: 'Bell'
  }
];

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  // SYSTEM_ADMIN tem TODAS as permissões
  if (role === UserRole.SYSTEM_ADMIN) {
    return true;
  }
  return ROLE_PERMISSIONS[role][permission];
}

export function canAccessRoute(userRole: UserRole, routePath: string): boolean {
  // SYSTEM_ADMIN pode acessar TODAS as rotas
  if (userRole === UserRole.SYSTEM_ADMIN) {
    return true;
  }
  const route = ROLE_BASED_ROUTES.find(r => r.path === routePath);
  return route ? route.roles.includes(userRole) : false;
}

export function getAccessibleRoutes(userRole: UserRole): RoleBasedRoute[] {
  // SYSTEM_ADMIN tem acesso a TODAS as rotas
  if (userRole === UserRole.SYSTEM_ADMIN) {
    return ROLE_BASED_ROUTES;
  }
  return ROLE_BASED_ROUTES.filter(route => route.roles.includes(userRole));
}