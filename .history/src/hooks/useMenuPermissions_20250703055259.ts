import { useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, hasPermission, ROLE_PERMISSIONS, RolePermissions } from '@/types/roles';
import { useMenuCache } from './useSmartCache';

interface MenuItem {
  href: string;
  icon: string;
  label: string;
  permission?: keyof RolePermissions;
  roles?: UserRole[];
  children?: MenuItem[];
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

export interface MenuPermissionOptions {
  /**
   * Se deve revalidar automaticamente quando o usuário ou role mudar
   */
  autoRevalidate?: boolean;
  /**
   * Callback chamado quando as permissões são atualizadas
   */
  onPermissionsUpdate?: (permissions: Record<string, boolean>) => void;
}

/**
 * Hook principal para gerenciar permissões de menu
 * Integra com o sistema de cache inteligente sem cache para dados sensíveis
 */
export function useMenuPermissions(
            return false;
          }
        }

        // Se tem permissão específica, verificar se o usuário tem essa permissão
        if (item.permission) {
          if (!hasPermission(userRole, item.permission)) {
            return false;
          }
        }

        // Se tem filhos, filtrar recursivamente
        if (item.children) {
          item.children = filterMenuItems(item.children);
          // Se não sobrou nenhum filho após filtrar, remover o item pai
          if (item.children.length === 0) {
            return false;
          }
        }

        return true;
      });
    };
  }, [userRole]);

  const filterMenuSections = useMemo(() => {
    return (sections: MenuSection[]): MenuSection[] => {
      return sections
        .map(section => ({
          ...section,
          items: filterMenuItems(section.items)
        }))
        .filter(section => section.items.length > 0);
    };
  }, [filterMenuItems]);

  const canAccessRoute = useMemo(() => {
    return (routePath: string, requiredPermission?: keyof RolePermissions): boolean => {
      // SYSTEM_ADMIN tem acesso a tudo
      if (userRole === UserRole.SYSTEM_ADMIN) {
        return true;
      }

      // Se tem permissão específica requerida, verificar
      if (requiredPermission) {
        return hasPermission(userRole, requiredPermission);
      }

      return true;
    };
  }, [userRole]);

  const getUserPermissions = useMemo(() => {
    return (): string[] => {
      if (!userRole) return [];
      
      const permissions = ROLE_PERMISSIONS[userRole];
      return Object.entries(permissions)
        .filter(([_, hasPermission]) => hasPermission)
        .map(([permission, _]) => permission);
    };
  }, [userRole]);

  const hasAnyPermission = useMemo(() => {
    return (permissions: (keyof RolePermissions)[]): boolean => {
      return permissions.some(permission => hasPermission(userRole, permission));
    };
  }, [userRole]);

  const hasAllPermissions = useMemo(() => {
    return (permissions: (keyof RolePermissions)[]): boolean => {
      return permissions.every(permission => hasPermission(userRole, permission));
    };
  }, [userRole]);

  return {
    userRole,
    user,
    filterMenuItems,
    filterMenuSections,
    canAccessRoute,
    getUserPermissions,
    hasPermission: (permission: keyof RolePermissions) => hasPermission(userRole, permission),
    hasAnyPermission,
    hasAllPermissions,
  };
}

// Hook específico para componentes que precisam verificar permissões
export function usePermissionCheck() {
  const { userRole } = useMenuPermissions();

  return {
    canManageSystem: hasPermission(userRole, 'canManageSystem'),
    canManageInstitutions: hasPermission(userRole, 'canManageInstitutions'),
    canManageGlobalUsers: hasPermission(userRole, 'canManageGlobalUsers'),
    canViewSystemAnalytics: hasPermission(userRole, 'canViewSystemAnalytics'),
    canManageSecurityPolicies: hasPermission(userRole, 'canManageSecurityPolicies'),
    canViewPortalReports: hasPermission(userRole, 'canViewPortalReports'),
    canManageSchools: hasPermission(userRole, 'canManageSchools'),
    canManageInstitutionUsers: hasPermission(userRole, 'canManageInstitutionUsers'),
    canManageClasses: hasPermission(userRole, 'canManageClasses'),
    canManageSchedules: hasPermission(userRole, 'canManageSchedules'),
    canViewInstitutionAnalytics: hasPermission(userRole, 'canViewInstitutionAnalytics'),
    canManageCycles: hasPermission(userRole, 'canManageCycles'),
    canManageCurriculum: hasPermission(userRole, 'canManageCurriculum'),
    canMonitorTeachers: hasPermission(userRole, 'canMonitorTeachers'),
    canViewAcademicAnalytics: hasPermission(userRole, 'canViewAcademicAnalytics'),
    canCoordinateDepartments: hasPermission(userRole, 'canCoordinateDepartments'),
    canManageAttendance: hasPermission(userRole, 'canManageAttendance'),
    canManageGrades: hasPermission(userRole, 'canManageGrades'),
    canManageLessonPlans: hasPermission(userRole, 'canManageLessonPlans'),
    canUploadResources: hasPermission(userRole, 'canUploadResources'),
    canCommunicateWithStudents: hasPermission(userRole, 'canCommunicateWithStudents'),
    canCommunicateWithGuardians: hasPermission(userRole, 'canCommunicateWithGuardians'),
    canViewOwnSchedule: hasPermission(userRole, 'canViewOwnSchedule'),
    canViewOwnGrades: hasPermission(userRole, 'canViewOwnGrades'),
    canAccessLearningMaterials: hasPermission(userRole, 'canAccessLearningMaterials'),
    canSubmitAssignments: hasPermission(userRole, 'canSubmitAssignments'),
    canTrackOwnProgress: hasPermission(userRole, 'canTrackOwnProgress'),
    canMessageTeachers: hasPermission(userRole, 'canMessageTeachers'),
    canViewChildrenInfo: hasPermission(userRole, 'canViewChildrenInfo'),
    canViewChildrenGrades: hasPermission(userRole, 'canViewChildrenGrades'),
    canViewChildrenAttendance: hasPermission(userRole, 'canViewChildrenAttendance'),
    canViewChildrenAssignments: hasPermission(userRole, 'canViewChildrenAssignments'),
    canReceiveAnnouncements: hasPermission(userRole, 'canReceiveAnnouncements'),
    canCommunicateWithSchool: hasPermission(userRole, 'canCommunicateWithSchool'),
    canScheduleMeetings: hasPermission(userRole, 'canScheduleMeetings'),
    canViewFinancialInfo: hasPermission(userRole, 'canViewFinancialInfo'),
    canViewPayments: hasPermission(userRole, 'canViewPayments'),
    canViewBoletos: hasPermission(userRole, 'canViewBoletos'),
    canViewFinancialHistory: hasPermission(userRole, 'canViewFinancialHistory'),
    userRole,
  };
}