'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Limpar tabela de permissions
  await knex('permissions').del();
  
  // Inserir permissions baseadas no arquivo roles.ts
  const permissions = [
    // System Management
    { name: 'canManageSystem', resource: 'system', action: 'manage', description: 'Gerenciar sistema' },
    { name: 'canManageInstitutions', resource: 'institutions', action: 'manage', description: 'Gerenciar instituições' },
    { name: 'canManageGlobalUsers', resource: 'users', action: 'manage_global', description: 'Gerenciar usuários globais' },
    { name: 'canViewSystemAnalytics', resource: 'analytics', action: 'view_system', description: 'Visualizar análises do sistema' },
    { name: 'canManageSecurityPolicies', resource: 'security', action: 'manage_policies', description: 'Gerenciar políticas de segurança' },
    { name: 'canViewPortalReports', resource: 'reports', action: 'view_portal', description: 'Visualizar relatórios do portal' },
    
    // Institution Management
    { name: 'canManageSchools', resource: 'schools', action: 'manage', description: 'Gerenciar escolas' },
    { name: 'canManageInstitutionUsers', resource: 'users', action: 'manage_institution', description: 'Gerenciar usuários da instituição' },
    { name: 'canManageClasses', resource: 'classes', action: 'manage', description: 'Gerenciar turmas' },
    { name: 'canManageSchedules', resource: 'schedules', action: 'manage', description: 'Gerenciar horários' },
    { name: 'canViewInstitutionAnalytics', resource: 'analytics', action: 'view_institution', description: 'Visualizar análises da instituição' },
    
    // Academic Management
    { name: 'canManageCycles', resource: 'cycles', action: 'manage', description: 'Gerenciar ciclos educacionais' },
    { name: 'canManageCurriculum', resource: 'curriculum', action: 'manage', description: 'Gerenciar currículo' },
    { name: 'canMonitorTeachers', resource: 'teachers', action: 'monitor', description: 'Monitorar professores' },
    { name: 'canViewAcademicAnalytics', resource: 'analytics', action: 'view_academic', description: 'Visualizar análises acadêmicas' },
    { name: 'canCoordinateDepartments', resource: 'departments', action: 'coordinate', description: 'Coordenar departamentos' },
    
    // Teaching
    { name: 'canManageAttendance', resource: 'attendance', action: 'manage', description: 'Gerenciar presença' },
    { name: 'canManageGrades', resource: 'grades', action: 'manage', description: 'Gerenciar notas' },
    { name: 'canManageLessonPlans', resource: 'lesson_plans', action: 'manage', description: 'Gerenciar planos de aula' },
    { name: 'canUploadResources', resource: 'resources', action: 'upload', description: 'Fazer upload de recursos' },
    { name: 'canCommunicateWithStudents', resource: 'communication', action: 'students', description: 'Comunicar com estudantes' },
    { name: 'canCommunicateWithGuardians', resource: 'communication', action: 'guardians', description: 'Comunicar com responsáveis' },
    
    // Student Access
    { name: 'canViewOwnSchedule', resource: 'schedule', action: 'view_own', description: 'Visualizar próprio horário' },
    { name: 'canViewOwnGrades', resource: 'grades', action: 'view_own', description: 'Visualizar próprias notas' },
    { name: 'canAccessLearningMaterials', resource: 'materials', action: 'access_learning', description: 'Acessar materiais de aprendizagem' },
    { name: 'canSubmitAssignments', resource: 'assignments', action: 'submit', description: 'Submeter tarefas' },
    { name: 'canTrackOwnProgress', resource: 'progress', action: 'track_own', description: 'Acompanhar próprio progresso' },
    { name: 'canMessageTeachers', resource: 'messages', action: 'teachers', description: 'Enviar mensagens para professores' },
    
    // Guardian Access
    { name: 'canViewChildrenInfo', resource: 'children', action: 'view_info', description: 'Visualizar informações dos filhos' },
    { name: 'canViewChildrenGrades', resource: 'children', action: 'view_grades', description: 'Visualizar notas dos filhos' },
    { name: 'canViewChildrenAttendance', resource: 'children', action: 'view_attendance', description: 'Visualizar presença dos filhos' },
    { name: 'canViewChildrenAssignments', resource: 'children', action: 'view_assignments', description: 'Visualizar tarefas dos filhos' },
    { name: 'canReceiveAnnouncements', resource: 'announcements', action: 'receive', description: 'Receber comunicados' },
    { name: 'canCommunicateWithSchool', resource: 'communication', action: 'school', description: 'Comunicar com a escola' },
    { name: 'canScheduleMeetings', resource: 'meetings', action: 'schedule', description: 'Agendar reuniões' },
    
    // Financial Access
    { name: 'canViewFinancialInfo', resource: 'financial', action: 'view_info', description: 'Visualizar informações financeiras' },
    { name: 'canViewPayments', resource: 'payments', action: 'view', description: 'Visualizar pagamentos' },
    { name: 'canViewBoletos', resource: 'boletos', action: 'view', description: 'Visualizar boletos' },
    { name: 'canViewFinancialHistory', resource: 'financial', action: 'view_history', description: 'Visualizar histórico financeiro' }
  ];
  
  const permissionsWithId = permissions.map((permission, index) => ({
    id: index + 1,
    ...permission,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }));
  
  await knex('permissions').insert(permissionsWithId);
}; 