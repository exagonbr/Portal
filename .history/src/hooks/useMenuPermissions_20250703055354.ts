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
  menuItems?: Array<{ permission?: string; href: string; label: string }>,
  options: MenuPermissionOptions = {}
) {
  const { user } = useAuth();
  const { autoRevalidate = true, onPermissionsUpdate } = options;
  
  const userRole = useMemo(() => {
    if (!user?.role) return UserRole.STUDENT;
    const normalizedRole = user.role.toUpperCase();
    return Object.values(UserRole).includes(normalizedRole as UserRole) 
      ? (normalizedRole as UserRole) 
      : UserRole.STUDENT;
  }, [user?.role]);

  // Criar chave única baseada no usuário e itens do menu (se fornecidos)
  const cacheKey = useMemo(() => {
    if (menuItems) {
      const itemsHash = menuItems
        .map(item => `${item.href}:${item.permission || 'none'}`)
        .join('|');
      return `menu-permissions-${user?.id || 'anonymous'}-${userRole}-${btoa(itemsHash).slice(0, 10)}`;
    }
    return `user-permissions-${user?.id || 'anonymous'}-${userRole}`;
  }, [user?.id, userRole, menuItems]);

  // Função para calcular permissões específicas do menu (se fornecido)
  const calculateMenuPermissions = useCallback(async () => {
    if (!menuItems) return {};
    
    console.log(`🔐 [useMenuPermissions] Calculando permissões para role: ${userRole}`);
    
    const permissions: Record<string, boolean> = {};
    
    for (const item of menuItems) {
      if (!item.permission) {
        // Item sem permissão específica - sempre acessível
        permissions[item.href] = true;
      } else {
        // Verificar permissão específica
        const hasAccess = hasPermission(userRole, item.permission as keyof RolePermissions);
        permissions[item.href] = hasAccess;
        
        console.log(`🔐 [useMenuPermissions] ${item.label} (${item.href}): ${hasAccess ? '✅ Permitido' : '❌ Negado'} - Permissão: ${item.permission}`);
      }
    }
    
    return permissions;
  }, [userRole, menuItems]);

  // Usar cache especializado para menu (sempre sem cache para dados sensíveis)
  const {
    data: menuPermissions,
    isLoading: isLoadingMenuPermissions,
    error: menuPermissionsError,
    revalidate: revalidateMenuPermissions
  } = useMenuCache({
    key: cacheKey,
    fetcher: calculateMenuPermissions,
    enabled: !!user && !!menuItems && menuItems.length > 0,
    onSuccess: (data: Record<string, boolean>) => {
      console.log(`🔐 [useMenuPermissions] Permissões de menu atualizadas:`, data);
      onPermissionsUpdate?.(data);
    },
    onError: (error: Error) => {
      console.error(`🔐 [useMenuPermissions] Erro ao calcular permissões de menu:`, error);
    }
  });

  // Filtrar itens de menu baseado nas permissões (se fornecidos)
  const filteredMenuItems = useMemo(() => {
    if (!menuItems || !menuPermissions) return [];
    
    return menuItems.filter(item => menuPermissions[item.href] === true);
  }, [menuItems, menuPermissions]);

  const filterMenuItems = useMemo(() => {
    return (items: MenuItem[]): MenuItem[] => {
      return items.filter(item => {
        // Se tem roles específicas definidas, verificar se o usuário tem uma delas
        if (item.roles && item.roles.length > 0) {
          if (!item.roles.includes(userRole)) {
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

  // Função para verificar se um item específico tem permissão
  const hasMenuPermission = useMemo(() => (href: string): boolean => {
    return menuPermissions?.[href] === true;
  }, [menuPermissions]);

  // Função para verificar uma permissão específica
  const checkPermission = useMemo(() => (permission: string): boolean => {
    return hasPermission(userRole, permission as keyof RolePermissions);
  }, [userRole]);

  // Revalidar automaticamente quando role mudar
  useMemo(() => {
    if (autoRevalidate && user && menuItems) {
      console.log(`🔄 [useMenuPermissions] Role mudou para: ${userRole}, revalidando permissões...`);
      revalidateMenuPermissions();
    }
  }, [userRole, user?.id, autoRevalidate, revalidateMenuPermissions, menuItems]);

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
    
    // Funcionalidades específicas para menu com cache inteligente
    permissions: menuPermissions || {},
    filteredMenuItems,
    isLoading: isLoadingMenuPermissions,
    error: menuPermissionsError,
    hasMenuPermission,
    checkPermission,
    revalidate: revalidateMenuPermissions,
    
    // Estatísticas das permissões
    stats: menuItems ? {
      total: menuItems.length,
      allowed: filteredMenuItems.length,
      denied: menuItems.length - filteredMenuItems.length,
      percentage: menuItems.length > 0 ? Math.round((filteredMenuItems.length / menuItems.length) * 100) : 0
    } : {
      total: 0,
      allowed: 0,
      denied: 0,
      percentage: 0
    }
  };
}

// Hook específico para componentes que precisam verificar permissões
export function usePermissionCheck(permission?: string) {
  const { userRole } = useMenuPermissions();

  const hasAccess = useMemo(() => {
    if (!permission) return true;
    return hasPermission(userRole, permission as keyof RolePermissions);
  }, [userRole, permission]);

  return {
    hasAccess,
    userRole,
    isLoading: false, // Não há loading para verificação simples
    
    // Permissões específicas para compatibilidade
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
  };
}

/**
 * Hook para gerenciar permissões de seções do menu
 */
export function useMenuSectionPermissions(
  sections: Array<{
    section: string;
    items: Array<{ permission?: string; href: string; label: string }>;
  }>,
  options: MenuPermissionOptions = {}
) {
  const { autoRevalidate = true, onPermissionsUpdate } = options;

  // Achatar todos os itens de todas as seções
  const allMenuItems = useMemo(() => {
    return sections.flatMap(section => section.items);
  }, [sections]);

  // Usar o hook principal
  const menuPermissions = useMenuPermissions(allMenuItems, {
    autoRevalidate,
    onPermissionsUpdate
  });

  // Filtrar seções baseado nas permissões
  const filteredSections = useMemo(() => {
    return sections.map(section => ({
      ...section,
      items: section.items.filter(item => menuPermissions.hasMenuPermission(item.href))
    })).filter(section => section.items.length > 0); // Remover seções vazias
  }, [sections, menuPermissions.hasMenuPermission]);

  return {
    ...menuPermissions,
    /**
     * Seções filtradas baseado nas permissões
     */
    filteredSections,
    
    /**
     * Estatísticas por seção
     */
    sectionStats: sections.map(section => ({
      section: section.section,
      total: section.items.length,
      allowed: section.items.filter(item => menuPermissions.hasMenuPermission(item.href)).length,
      denied: section.items.length - section.items.filter(item => menuPermissions.hasMenuPermission(item.href)).length
    }))
  };
}

export default useMenuPermissions;