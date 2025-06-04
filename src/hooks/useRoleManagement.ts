import { useState, useMemo } from 'react'
import { 
  UserRole, 
  ROLE_PERMISSIONS, 
  ROLE_LABELS, 
  ROLE_DESCRIPTIONS,
  RolePermissions 
} from '@/types/roles'
import { 
  ExtendedRole, 
  CustomRole, 
  PERMISSION_GROUPS,
  PermissionDefinition 
} from '@/types/roleManagement'

// Helper para criar permissões vazias
const createEmptyPermissions = (): RolePermissions => ({
  canManageSystem: false,
  canManageInstitutions: false,
  canManageGlobalUsers: false,
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
  canViewChildrenInfo: false,
  canViewChildrenGrades: false,
  canViewChildrenAttendance: false,
  canViewChildrenAssignments: false,
  canReceiveAnnouncements: false,
  canCommunicateWithSchool: false,
  canScheduleMeetings: false,
  canViewFinancialInfo: false,
  canViewPayments: false,
  canViewBoletos: false,
  canViewFinancialHistory: false
})

// Mock de contagem de usuários por role
const MOCK_USER_COUNTS: Record<UserRole, number> = {
  [UserRole.SYSTEM_ADMIN]: 3,
  [UserRole.INSTITUTION_MANAGER]: 12,
  [UserRole.ACADEMIC_COORDINATOR]: 28,
  [UserRole.TEACHER]: 145,
  [UserRole.STUDENT]: 2847,
  [UserRole.GUARDIAN]: 1923
}

export function useRoleManagement() {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([
    {
      id: 'custom_coordinator',
      name: 'Coordenador Especial',
      description: 'Coordenador com permissões personalizadas para projetos específicos',
      type: 'custom',
      permissions: {
        ...createEmptyPermissions(),
        canManageClasses: true,
        canManageSchedules: true,
        canMonitorTeachers: true,
        canViewAcademicAnalytics: true,
        canUploadResources: true,
        canCommunicateWithStudents: true,
        canCommunicateWithGuardians: true
      },
      userCount: 5,
      status: 'active',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-02-01T14:20:00.000Z'
    }
  ])

  // Converter roles do sistema para o formato estendido
  const systemRoles: ExtendedRole[] = useMemo(() => {
    return Object.values(UserRole).map(role => ({
      role,
      name: ROLE_LABELS[role],
      description: ROLE_DESCRIPTIONS[role],
      type: 'system' as const,
      permissions: ROLE_PERMISSIONS[role],
      userCount: MOCK_USER_COUNTS[role],
      status: 'active' as const,
      isEditable: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }))
  }, [])

  // Combinar roles do sistema com customizadas
  const allRoles = useMemo(() => {
    const systemRolesList = systemRoles
    const customRolesList = customRoles.map(role => ({
      role: null as any,
      name: role.name,
      description: role.description,
      type: 'custom' as const,
      permissions: role.permissions,
      userCount: role.userCount,
      status: role.status,
      isEditable: true,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      id: role.id
    }))
    
    return [...systemRolesList, ...customRolesList]
  }, [systemRoles, customRoles])

  // Estatísticas
  const statistics = useMemo(() => {
    const totalRoles = allRoles.length
    const customRoleCount = customRoles.length
    const totalUsers = allRoles.reduce((sum, role) => sum + role.userCount, 0)
    const activeRoles = allRoles.filter(role => role.status === 'active').length
    
    return {
      totalRoles,
      customRoles: customRoleCount,
      systemRoles: totalRoles - customRoleCount,
      totalUsers,
      activeRoles,
      inactiveRoles: totalRoles - activeRoles
    }
  }, [allRoles, customRoles])

  // Criar nova role customizada
  const createCustomRole = (roleData: {
    name: string
    description: string
    permissions: RolePermissions
  }) => {
    const newRole: CustomRole = {
      id: `custom_${Date.now()}`,
      name: roleData.name,
      description: roleData.description,
      type: 'custom',
      permissions: roleData.permissions,
      userCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCustomRoles(prev => [...prev, newRole])
    return newRole
  }

  // Atualizar role customizada
  const updateCustomRole = (id: string, updates: Partial<CustomRole>) => {
    setCustomRoles(prev => prev.map(role => 
      role.id === id 
        ? { ...role, ...updates, updatedAt: new Date().toISOString() }
        : role
    ))
  }

  // Deletar role customizada
  const deleteCustomRole = (id: string) => {
    setCustomRoles(prev => prev.filter(role => role.id !== id))
  }

  // Clonar role (criar nova baseada em existente)
  const cloneRole = (sourceRole: ExtendedRole | (CustomRole & { id: string })) => {
    const clonedRole: CustomRole = {
      id: `custom_${Date.now()}`,
      name: `${sourceRole.name} (Cópia)`,
      description: `Cópia de ${sourceRole.description}`,
      type: 'custom',
      permissions: { ...sourceRole.permissions },
      userCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setCustomRoles(prev => [...prev, clonedRole])
    return clonedRole
  }

  // Obter todas as permissões disponíveis
  const getAllPermissions = (): PermissionDefinition[] => {
    return PERMISSION_GROUPS.flatMap(group => group.permissions)
  }

  // Contar permissões ativas para uma role
  const countActivePermissions = (permissions: RolePermissions): number => {
    return Object.values(permissions).filter(Boolean).length
  }

  // Verificar se role pode ser editada
  const canEditRole = (role: ExtendedRole | (CustomRole & { id: string })): boolean => {
    return 'id' in role || role.type === 'custom'
  }

  // Verificar se role pode ser deletada
  const canDeleteRole = (role: ExtendedRole | (CustomRole & { id: string })): boolean => {
    return 'id' in role && role.userCount === 0
  }

  return {
    // Dados
    systemRoles,
    customRoles,
    allRoles,
    statistics,
    permissionGroups: PERMISSION_GROUPS,
    
    // Operações
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
    cloneRole,
    
    // Utilitários
    getAllPermissions,
    countActivePermissions,
    canEditRole,
    canDeleteRole,
    createEmptyPermissions
  }
} 