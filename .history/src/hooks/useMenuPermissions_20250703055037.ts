import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, hasPermission } from '@/types/roles';
import { useMenuCache } from './useSmartCache';

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
 * Hook para gerenciar permissões de menu baseadas na role do usuário
 * Sempre busca dados frescos para garantir que mudanças de role sejam refletidas imediatamente
 */
export function useMenuPermissions(
  menuItems: Array<{ permission?: string; href: string; label: string }>,
  options: MenuPermissionOptions = {}
) {
  const { user } = useAuth();
  const { autoRevalidate = true, onPermissionsUpdate } = options;

  // Normalizar role do usuário
  const userRole = useMemo(() => {
    if (!user?.role) return UserRole.STUDENT;
    const normalizedRole = user.role.toUpperCase() as UserRole;
    return normalizedRole in UserRole ? normalizedRole : UserRole.STUDENT;
  }, [user?.role]);

  // Criar chave única baseada no usuário e itens do menu
  const cacheKey = useMemo(() => {
    const itemsHash = menuItems
      .map(item => `${item.href}:${item.permission || 'none'}`)
      .join('|');
    return `menu-permissions-${user?.id || 'anonymous'}-${userRole}-${btoa(itemsHash).slice(0, 10)}`;
  }, [user?.id, userRole, menuItems]);

  // Função para calcular permissões
  const calculatePermissions = useMemo(() => async () => {
    console.log(`🔐 [useMenuPermissions] Calculando permissões para role: ${userRole}`);
    
    const permissions: Record<string, boolean> = {};
    
    for (const item of menuItems) {
      if (!item.permission) {
        // Item sem permissão específica - sempre acessível
        permissions[item.href] = true;
      } else {
        // Verificar permissão específica
        const hasAccess = hasPermission(userRole, item.permission as any);
        permissions[item.href] = hasAccess;
        
        console.log(`🔐 [useMenuPermissions] ${item.label} (${item.href}): ${hasAccess ? '✅ Permitido' : '❌ Negado'} - Permissão: ${item.permission}`);
      }
    }
    
    return permissions;
  }, [userRole, menuItems]);

  // Usar cache especializado para menu
  const {
    data: permissions,
    isLoading,
    error,
    revalidate
  } = useMenuCache({
    key: cacheKey,
    fetcher: calculatePermissions,
    enabled: !!user && menuItems.length > 0,
    onSuccess: (data) => {
      console.log(`🔐 [useMenuPermissions] Permissões atualizadas:`, data);
      onPermissionsUpdate?.(data);
    },
    onError: (error) => {
      console.error(`🔐 [useMenuPermissions] Erro ao calcular permissões:`, error);
    }
  });

  // Filtrar itens de menu baseado nas permissões
  const filteredMenuItems = useMemo(() => {
    if (!permissions) return [];
    
    return menuItems.filter(item => permissions[item.href] === true);
  }, [menuItems, permissions]);

  // Função para verificar se um item específico tem permissão
  const hasMenuPermission = useMemo(() => (href: string): boolean => {
    return permissions?.[href] === true;
  }, [permissions]);

  // Função para verificar se uma permissão específica é válida para o usuário atual
  const checkPermission = useMemo(() => (permission: string): boolean => {
    return hasPermission(userRole, permission as any);
  }, [userRole]);

  // Revalidar automaticamente quando role mudar
  useMemo(() => {
    if (autoRevalidate && user) {
      console.log(`🔄 [useMenuPermissions] Role mudou para: ${userRole}, revalidando permissões...`);
      revalidate();
    }
  }, [userRole, user?.id, autoRevalidate, revalidate]);

  return {
    /**
     * Permissões calculadas para cada item do menu
     */
    permissions: permissions || {},
    
    /**
     * Itens de menu filtrados baseado nas permissões
     */
    filteredMenuItems,
    
    /**
     * Se está carregando as permissões
     */
    isLoading,
    
    /**
     * Erro ao calcular permissões
     */
    error,
    
    /**
     * Role atual do usuário
     */
    userRole,
    
    /**
     * Função para verificar se um item específico tem permissão
     */
    hasMenuPermission,
    
    /**
     * Função para verificar uma permissão específica
     */
    checkPermission,
    
    /**
     * Função para forçar revalidação das permissões
     */
    revalidate,
    
    /**
     * Estatísticas das permissões
     */
    stats: {
      total: menuItems.length,
      allowed: filteredMenuItems.length,
      denied: menuItems.length - filteredMenuItems.length,
      percentage: menuItems.length > 0 ? Math.round((filteredMenuItems.length / menuItems.length) * 100) : 0
    }
  };
}

/**
 * Hook simplificado para verificar uma única permissão
 */
export function usePermissionCheck(permission: string) {
  const { user } = useAuth();
  
  const userRole = useMemo(() => {
    if (!user?.role) return UserRole.STUDENT;
    const normalizedRole = user.role.toUpperCase() as UserRole;
    return normalizedRole in UserRole ? normalizedRole : UserRole.STUDENT;
  }, [user?.role]);

  const hasAccess = useMemo(() => {
    return hasPermission(userRole, permission as any);
  }, [userRole, permission]);

  return {
    hasAccess,
    userRole,
    isLoading: false // Não há loading para verificação simples
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
  const { user } = useAuth();
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