'use strict';

/**
 * @param {import('knex').Knex} knex
 */
exports.seed = async function(knex) {
  // Limpar tabela de role_permissions
  await knex('role_permissions').del();
  
  // Buscar todas as permissions
  const allPermissions = await knex('permissions').select('id', 'name');
  const permissionMap = {};
  allPermissions.forEach(permission => {
    permissionMap[permission.name] = permission.id;
  });
  
  // SYSTEM_ADMIN tem TODAS as permissões
  const systemAdminPermissions = allPermissions.map(permission => ({
    role_id: 1, // SYSTEM_ADMIN
    permission_id: permission.id,
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }));
  
  // INSTITUTION_MANAGER permissions
  const institutionManagerPermissions = [
    'canViewPortalReports',
    'canManageSchools',
    'canManageInstitutionUsers',
    'canManageClasses',
    'canManageSchedules',
    'canViewInstitutionAnalytics',
    'canManageCycles',
    'canManageCurriculum',
    'canMonitorTeachers',
    'canViewAcademicAnalytics',
    'canCoordinateDepartments',
    'canCommunicateWithStudents',
    'canCommunicateWithGuardians',
    'canReceiveAnnouncements'
  ].map(permissionName => ({
    role_id: 2, // INSTITUTION_MANAGER
    permission_id: permissionMap[permissionName],
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }));
  
  // COORDINATOR permissions
  const coordinatorPermissions = [
    'canViewPortalReports',
    'canManageClasses',
    'canManageSchedules',
    'canViewInstitutionAnalytics',
    'canManageCycles',
    'canManageCurriculum',
    'canMonitorTeachers',
    'canViewAcademicAnalytics',
    'canCoordinateDepartments',
    'canUploadResources',
    'canCommunicateWithStudents',
    'canCommunicateWithGuardians',
    'canMessageTeachers',
    'canReceiveAnnouncements'
  ].map(permissionName => ({
    role_id: 3, // COORDINATOR
    permission_id: permissionMap[permissionName],
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }));
  
  // TEACHER permissions
  const teacherPermissions = [
    'canViewPortalReports',
    'canManageAttendance',
    'canManageGrades',
    'canManageLessonPlans',
    'canUploadResources',
    'canCommunicateWithStudents',
    'canCommunicateWithGuardians',
    'canViewOwnSchedule',
    'canAccessLearningMaterials',
    'canMessageTeachers',
    'canReceiveAnnouncements',
    'canCommunicateWithSchool'
  ].map(permissionName => ({
    role_id: 4, // TEACHER
    permission_id: permissionMap[permissionName],
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }));
  
  // STUDENT permissions
  const studentPermissions = [
    'canCommunicateWithStudents',
    'canViewOwnSchedule',
    'canViewOwnGrades',
    'canAccessLearningMaterials',
    'canSubmitAssignments',
    'canTrackOwnProgress',
    'canMessageTeachers',
    'canReceiveAnnouncements'
  ].map(permissionName => ({
    role_id: 5, // STUDENT
    permission_id: permissionMap[permissionName],
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }));
  
  // GUARDIAN permissions
  const guardianPermissions = [
    'canViewChildrenInfo',
    'canViewChildrenGrades',
    'canViewChildrenAttendance',
    'canViewChildrenAssignments',
    'canReceiveAnnouncements',
    'canCommunicateWithSchool',
    'canScheduleMeetings',
    'canViewFinancialInfo',
    'canViewPayments',
    'canViewBoletos',
    'canViewFinancialHistory'
  ].map(permissionName => ({
    role_id: 6, // GUARDIAN
    permission_id: permissionMap[permissionName],
    created_at: knex.fn.now(),
    updated_at: knex.fn.now()
  }));
  
  // Inserir todas as role_permissions
  const allRolePermissions = [
    ...systemAdminPermissions,
    ...institutionManagerPermissions,
    ...coordinatorPermissions,
    ...teacherPermissions,
    ...studentPermissions,
    ...guardianPermissions
  ];
  
  // Inserir em lotes para evitar problemas de performance
  const batchSize = 100;
  for (let i = 0; i < allRolePermissions.length; i += batchSize) {
    const batch = allRolePermissions.slice(i, i + batchSize);
    await knex('role_permissions').insert(batch);
  }
}; 