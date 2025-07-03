'use client';

import React, { ReactNode } from 'react';
import { useMenuPermissions } from '@/hooks/useMenuPermissions';
import { UserRole, ROLE_PERMISSIONS } from '@/types/roles';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN];
  permissions?: (keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN])[];
  roles?: UserRole[];
  requireAll?: boolean; // Se true, requer TODAS as permissões. Se false, requer QUALQUER uma
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Componente para proteger conteúdo baseado em permissões e roles
 * 
 * @param children - Conteúdo a ser renderizado se o usuário tiver permissão
 * @param permission - Permissão única requerida
 * @param permissions - Array de permissões (usar com requireAll para definir comportamento)
 * @param roles - Roles específicas que podem acessar o conteúdo
 * @param requireAll - Se true, requer todas as permissões. Se false, requer qualquer uma
 * @param fallback - Componente a ser renderizado se não tiver permissão
 * @param showFallback - Se deve mostrar o fallback ou não renderizar nada
 */
export function PermissionGuard({
  children,
  permission,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  showFallback = false
}: PermissionGuardProps) {
  const { userRole, hasPermission, hasAnyPermission, hasAllPermissions } = useMenuPermissions();

  // Verificar roles específicas
  if (roles.length > 0 && !roles.includes(userRole)) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Verificar permissão única
  if (permission && !hasPermission(permission)) {
    return showFallback ? <>{fallback}</> : null;
  }

  // Verificar múltiplas permissões
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return showFallback ? <>{fallback}</> : null;
    }
  }

  return <>{children}</>;
}

/**
 * Componente para mostrar conteúdo apenas para administradores do sistema
 */
export function SystemAdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={[UserRole.SYSTEM_ADMIN]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para mostrar conteúdo apenas para gestores de instituição
 */
export function InstitutionManagerOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={[UserRole.INSTITUTION_MANAGER]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para mostrar conteúdo apenas para coordenadores
 */
export function CoordinatorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={[UserRole.COORDINATOR]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para mostrar conteúdo apenas para professores
 */
export function TeacherOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={[UserRole.TEACHER]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para mostrar conteúdo apenas para estudantes
 */
export function StudentOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={[UserRole.STUDENT]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para mostrar conteúdo apenas para responsáveis
 */
export function GuardianOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard roles={[UserRole.GUARDIAN]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para mostrar conteúdo para roles administrativas (System Admin, Institution Manager, Coordinator)
 */
export function AdminRolesOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard 
      roles={[UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER, UserRole.COORDINATOR]} 
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para mostrar conteúdo para roles educacionais (Teacher, Student)
 */
export function EducationalRolesOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionGuard 
      roles={[UserRole.TEACHER, UserRole.STUDENT]} 
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Hook para usar dentro de componentes para verificações condicionais
 */
export function usePermissionGuard() {
  const { userRole, hasPermission, hasAnyPermission, hasAllPermissions } = useMenuPermissions();

  const canAccess = (
    permission?: keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN],
    permissions?: (keyof typeof ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN])[],
    roles?: UserRole[],
    requireAll = false
  ): boolean => {
    // Verificar roles específicas
    if (roles && roles.length > 0 && !roles.includes(userRole)) {
      return false;
    }

    // Verificar permissão única
    if (permission && !hasPermission(permission)) {
      return false;
    }

    // Verificar múltiplas permissões
    if (permissions && permissions.length > 0) {
      const hasRequiredPermissions = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);

      if (!hasRequiredPermissions) {
        return false;
      }
    }

    return true;
  };

  return {
    canAccess,
    userRole,
    isSystemAdmin: userRole === UserRole.SYSTEM_ADMIN,
    isInstitutionManager: userRole === UserRole.INSTITUTION_MANAGER,
    isCoordinator: userRole === UserRole.COORDINATOR,
    isTeacher: userRole === UserRole.TEACHER,
    isStudent: userRole === UserRole.STUDENT,
    isGuardian: userRole === UserRole.GUARDIAN,
    isAdminRole: [UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER, UserRole.COORDINATOR].includes(userRole),
    isEducationalRole: [UserRole.TEACHER, UserRole.STUDENT].includes(userRole),
  };
}