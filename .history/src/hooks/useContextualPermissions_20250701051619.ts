import { useState, useEffect, useCallback } from 'react';
import { RolePermissions } from '@/types/roles';

interface ContextualPermission {
  permission_key: keyof RolePermissions;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
  source: 'role' | 'group' | 'direct';
  source_name: string;
}

interface PermissionMatrix {
  [key: string]: {
    global: boolean | null;
    institutions: { [id: string]: boolean | null };
    schools: { [id: string]: boolean | null };
  };
}

export const useContextualPermissions = (userId?: string) => {
  const [permissions, setPermissions] = useState<ContextualPermission[]>([]);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPermissions = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/permissions/users/${targetUserId}/effective`);
      const data = await response.json();

      if (data.success) {
        setPermissions(data.data);
        // Converter para matrix format se necessário
        const matrix = convertToMatrix(data.data);
        setPermissionMatrix(matrix);
      } else {
        setError(data.error || 'Erro ao carregar permissões');
      }
    } catch (err) {
      setError('Erro de conexão ao carregar permissões');
      console.log('Erro ao buscar permissões:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setUserPermission = async (
    targetUserId: string,
    permissionKey: keyof RolePermissions,
    allowed: boolean,
    contextType: 'global' | 'institution' | 'school' = 'global',
    contextId?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/permissions/users/${targetUserId}/contextual`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permission_key: permissionKey,
          allowed,
          context_type: contextType,
          context_id: contextId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Recarregar permissões
        await fetchUserPermissions(targetUserId);
        return true;
      } else {
        setError(data.error || 'Erro ao definir permissão');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão ao definir permissão');
      console.log('Erro ao definir permissão:', err);
      return false;
    }
  };

  const calculateEffectivePermission = (
    permissionKey: keyof RolePermissions,
    contextType: 'global' | 'institution' | 'school' = 'global',
    contextId?: string
  ): boolean | null => {
    const relevantPermissions = permissions.filter(p => 
      p.permission_key === permissionKey &&
      p.context_type === contextType &&
      (contextType === 'global' || p.context_id === contextId)
    );

    if (relevantPermissions.length === 0) return null;

    // Ordem de precedência: direct > group > role
    const precedenceOrder = { direct: 3, group: 2, role: 1 };
    
    const sortedPermissions = relevantPermissions.sort((a, b) => 
      precedenceOrder[b.source] - precedenceOrder[a.source]
    );

    return sortedPermissions[0]?.allowed ?? null;
  };

  const hasPermission = (
    permissionKey: keyof RolePermissions,
    contextType: 'global' | 'institution' | 'school' = 'global',
    contextId?: string
  ): boolean => {
    const effective = calculateEffectivePermission(permissionKey, contextType, contextId);
    
    // Se não há permissão específica, usar permissão global
    if (effective === null && contextType !== 'global') {
      return hasPermission(permissionKey, 'global');
    }
    
    return effective === true;
  };

  const getPermissionConflicts = (permissionKey: keyof RolePermissions) => {
    const permissionConflicts = permissions
      .filter(p => p.permission_key === permissionKey)
      .reduce((acc, permission) => {
        const key = `${permission.context_type}-${permission.context_id || 'global'}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(permission);
        return acc;
      }, {} as Record<string, ContextualPermission[]>);

    return Object.entries(permissionConflicts)
      .filter(([_, perms]) => perms.length > 1)
      .map(([context, perms]) => ({
        context,
        permissions: perms,
        hasConflict: perms.some(p => p.allowed) && perms.some(p => !p.allowed)
      }));
  };

  useEffect(() => {
    if (userId) {
      fetchUserPermissions(userId);
    }
  }, [userId, fetchUserPermissions]);

  return {
    permissions,
    permissionMatrix,
    loading,
    error,
    fetchUserPermissions,
    setUserPermission,
    hasPermission,
    calculateEffectivePermission,
    getPermissionConflicts,
    clearError: () => setError(null)
  };
};

// Função auxiliar para converter permissões em formato matrix
const convertToMatrix = (permissions: ContextualPermission[]): PermissionMatrix => {
  const matrix: PermissionMatrix = {};

  permissions.forEach(permission => {
    if (!matrix[permission.permission_key]) {
      matrix[permission.permission_key] = {
        global: null,
        institutions: {},
        schools: {}
      };
    }

    if (permission.context_type === 'global') {
      matrix[permission.permission_key].global = permission.allowed;
    } else if (permission.context_type === 'institution' && permission.context_id) {
      matrix[permission.permission_key].institutions[permission.context_id] = permission.allowed;
    } else if (permission.context_type === 'school' && permission.context_id) {
      matrix[permission.permission_key].schools[permission.context_id] = permission.allowed;
    }
  });

  return matrix;
};

export const usePermissionMatrix = (userId?: string) => {
  const {
    permissionMatrix,
    loading,
    error,
    fetchUserPermissions,
    setUserPermission
  } = useContextualPermissions(userId);

  const updatePermissionInMatrix = async (
    permissionKey: keyof RolePermissions,
    allowed: boolean | null,
    contextType: 'global' | 'institution' | 'school',
    contextId?: string
  ): Promise<boolean> => {
    if (!userId) return false;

    if (allowed === null) {
      // Remover permissão - implementar endpoint DELETE
      return false;
    }

    return setUserPermission(userId, permissionKey, allowed, contextType, contextId);
  };

  const getPermissionValue = (
    permissionKey: keyof RolePermissions,
    contextType: 'global' | 'institution' | 'school',
    contextId?: string
  ): boolean | null => {
    const permission = permissionMatrix[permissionKey];
    if (!permission) return null;

    if (contextType === 'global') {
      return permission.global;
    } else if (contextType === 'institution' && contextId) {
      return permission.institutions[contextId] ?? null;
    } else if (contextType === 'school' && contextId) {
      return permission.schools[contextId] ?? null;
    }

    return null;
  };

  return {
    permissionMatrix,
    loading,
    error,
    fetchUserPermissions,
    updatePermissionInMatrix,
    getPermissionValue
  };
};
