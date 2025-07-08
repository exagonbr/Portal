import { useState, useEffect, useCallback } from 'react';
import { rolePermissionsService, RolePermission, CreateRolePermissionDto, Permission, Role } from '@/services/rolePermissionsService';

export function useRolePermissions() {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRolePermissions = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await rolePermissionsService.getAllWithPagination(page, limit);
      setRolePermissions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar permissões de função');
    } finally {
      setLoading(false);
    }
  }, []);

  const assignPermission = useCallback(async (roleId: string, permissionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const newRolePermission = await rolePermissionsService.assignPermissionToRole(roleId, permissionId);
      setRolePermissions(prev => [newRolePermission, ...prev]);
      return newRolePermission;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir permissão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokePermission = useCallback(async (roleId: string, permissionId: string) => {
    setLoading(true);
    setError(null);
    try {
      await rolePermissionsService.revokePermissionFromRole(roleId, permissionId);
      setRolePermissions(prev => prev.filter(rp => 
        !(rp.roleId === roleId && rp.permissionId === permissionId)
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revogar permissão');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignMultiplePermissions = useCallback(async (roleId: string, permissionIds: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const newRolePermissions = await rolePermissionsService.assignMultiplePermissionsToRole(roleId, permissionIds);
      setRolePermissions(prev => [...newRolePermissions, ...prev]);
      return newRolePermissions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir múltiplas permissões');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const revokeAllPermissions = useCallback(async (roleId: string) => {
    setLoading(true);
    setError(null);
    try {
      await rolePermissionsService.revokeAllPermissionsFromRole(roleId);
      setRolePermissions(prev => prev.filter(rp => rp.roleId !== roleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revogar todas as permissões');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermission = useCallback(async (roleId: string, permissionId: string) => {
    try {
      return await rolePermissionsService.hasPermission(roleId, permissionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar permissão');
      return false;
    }
  }, []);

  return {
    rolePermissions,
    loading,
    error,
    fetchRolePermissions,
    assignPermission,
    revokePermission,
    assignMultiplePermissions,
    revokeAllPermissions,
    checkPermission,
  };
}

export function useRolePermissionsByRole(roleId?: string) {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const rolePermissions = await rolePermissionsService.getByRoleId(id);
      setPermissions(rolePermissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar permissões da função');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (roleId) {
      fetchPermissions(roleId);
    }
  }, [roleId, fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refetch: () => roleId && fetchPermissions(roleId),
  };
}

export function useAvailablePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const availablePermissions = await rolePermissionsService.getAvailablePermissions();
      setPermissions(availablePermissions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar permissões disponíveis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
  };
}

export function useAvailableRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const availableRoles = await rolePermissionsService.getAvailableRoles();
      setRoles(availableRoles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar funções disponíveis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
  };
} 