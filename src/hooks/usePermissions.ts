import { useAuth } from '@/contexts/AuthContext'
import { UserRole, ROLE_PERMISSIONS } from '@/types/roles'

export function usePermissions() {
  const { user } = useAuth()

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user?.role) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(user.role as UserRole)
  }

  const hasPermission = (
    permission: keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN] | 
    Array<keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]>
  ): boolean => {
    if (!user?.role) return false
    
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole]
    if (!userPermissions) return false
    
    const permissions = Array.isArray(permission) ? permission : [permission]
    return permissions.every(p => userPermissions[p] === true)
  }

  const hasAnyPermission = (
    permissions: Array<keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]>
  ): boolean => {
    if (!user?.role) return false
    
    const userPermissions = ROLE_PERMISSIONS[user.role as UserRole]
    if (!userPermissions) return false
    
    return permissions.some(p => userPermissions[p] === true)
  }

  const canAccess = (resource: string, action: string): boolean => {
    if (!user?.role) return false
    
    // System admin tem acesso a tudo
    if ((user.role as string) === 'SYSTEM_ADMIN') return true
    
    // Verificar permissões específicas baseadas no recurso e ação
    const permissionKey = `${resource}.${action}` as keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]
    return hasPermission(permissionKey)
  }

  const isSystemAdmin = (): boolean => hasRole(UserRole.SYSTEM_ADMIN)
  const isInstitutionManager = (): boolean => hasRole(UserRole.INSTITUTION_MANAGER)
  const isAcademicCoordinator = (): boolean => hasRole(UserRole.COORDINATOR)
  const isTeacher = (): boolean => hasRole(UserRole.TEACHER)
  const isStudent = (): boolean => hasRole(UserRole.STUDENT)
  const isGuardian = (): boolean => hasRole(UserRole.GUARDIAN)

  const isStaff = (): boolean => hasRole([
    UserRole.SYSTEM_ADMIN,
    UserRole.INSTITUTION_MANAGER,
    UserRole.COORDINATOR,
    UserRole.TEACHER
  ])

  const isManagement = (): boolean => hasRole([
    UserRole.SYSTEM_ADMIN,
    UserRole.INSTITUTION_MANAGER,
    UserRole.COORDINATOR
  ])

  return {
    hasRole,
    hasPermission,
    hasAnyPermission,
    canAccess,
    isSystemAdmin,
    isInstitutionManager,
    isAcademicCoordinator,
    isTeacher,
    isStudent,
    isGuardian,
    isStaff,
    isManagement,
    userRole: user?.role as UserRole | undefined,
    permissions: user?.role ? ROLE_PERMISSIONS[user.role as UserRole] : null
  }
} 