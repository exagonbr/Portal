import { useState, useEffect, useCallback } from 'react';
import { 
  UserGroup, 
  CreateGroupData, 
  UpdateGroupData, 
  GroupMemberWithUser, 
  GroupPermission,
  GroupFilter,
  GroupStats 
} from '@/types/groups';

export const useGroupManagement = (filters?: GroupFilter) => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (filters?.institution_id) searchParams.set('institution_id', filters.institution_id);
      if (filters?.school_id) searchParams.set('school_id', filters.school_id);
      if (filters?.is_active !== undefined) searchParams.set('is_active', String(filters.is_active));
      if (filters?.search) searchParams.set('search', filters.search);

      const response = await fetch(`/api/groups?${searchParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setGroups(data.data);
      } else {
        setError(data.error || 'Erro ao carregar grupos');
      }
    } catch (err) {
      setError('Erro de conexão ao carregar grupos');
      console.error('Erro ao buscar grupos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (groupData: CreateGroupData): Promise<UserGroup | null> => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchGroups(); // Recarregar lista
        return data.data;
      } else {
        setError(data.error || 'Erro ao criar grupo');
        return null;
      }
    } catch (err) {
      setError('Erro de conexão ao criar grupo');
      console.error('Erro ao criar grupo:', err);
      return null;
    }
  };

  const updateGroup = async (id: string, updateData: UpdateGroupData): Promise<UserGroup | null> => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchGroups(); // Recarregar lista
        return data.data;
      } else {
        setError(data.error || 'Erro ao atualizar grupo');
        return null;
      }
    } catch (err) {
      setError('Erro de conexão ao atualizar grupo');
      console.error('Erro ao atualizar grupo:', err);
      return null;
    }
  };

  const deleteGroup = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchGroups(); // Recarregar lista
        return true;
      } else {
        setError(data.error || 'Erro ao excluir grupo');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão ao excluir grupo');
      console.error('Erro ao excluir grupo:', err);
      return false;
    }
  };

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    clearError: () => setError(null)
  };
};

export const useGroupDetails = (groupId: string | null) => {
  const [group, setGroup] = useState<UserGroup | null>(null);
  const [members, setMembers] = useState<GroupMemberWithUser[]>([]);
  const [permissions, setPermissions] = useState<GroupPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupDetails = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar dados do grupo
      const [groupResponse, membersResponse, permissionsResponse] = await Promise.all([
        fetch(`/api/groups/${groupId}`),
        fetch(`/api/groups/${groupId}/members`),
        fetch(`/api/groups/${groupId}/permissions`)
      ]);

      const [groupData, membersData, permissionsData] = await Promise.all([
        groupResponse.json(),
        membersResponse.json(),
        permissionsResponse.json()
      ]);

      if (groupData.success) setGroup(groupData.data);
      if (membersData.success) setMembers(membersData.data);
      if (permissionsData.success) setPermissions(permissionsData.data);

      if (!groupData.success) {
        setError(groupData.error || 'Erro ao carregar grupo');
      }
    } catch (err) {
      setError('Erro de conexão ao carregar detalhes do grupo');
      console.error('Erro ao buscar detalhes do grupo:', err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroupDetails();
  }, [fetchGroupDetails]);

  const addMember = async (userId: string, role: 'member' | 'admin' = 'member'): Promise<boolean> => {
    if (!groupId) return false;

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role })
      });

      const data = await response.json();

      if (data.success) {
        await fetchGroupDetails(); // Recarregar dados
        return true;
      } else {
        setError(data.error || 'Erro ao adicionar membro');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão ao adicionar membro');
      console.error('Erro ao adicionar membro:', err);
      return false;
    }
  };

  const removeMember = async (userId: string): Promise<boolean> => {
    if (!groupId) return false;

    try {
      const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchGroupDetails(); // Recarregar dados
        return true;
      } else {
        setError(data.error || 'Erro ao remover membro');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão ao remover membro');
      console.error('Erro ao remover membro:', err);
      return false;
    }
  };

  const setPermission = async (
    permissionKey: string,
    allowed: boolean,
    contextType: 'global' | 'institution' | 'school' = 'global',
    contextId?: string
  ): Promise<boolean> => {
    if (!groupId) return false;

    try {
      const response = await fetch(`/api/groups/${groupId}/permissions`, {
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
        await fetchGroupDetails(); // Recarregar dados
        return true;
      } else {
        setError(data.error || 'Erro ao definir permissão');
        return false;
      }
    } catch (err) {
      setError('Erro de conexão ao definir permissão');
      console.error('Erro ao definir permissão:', err);
      return false;
    }
  };

  return {
    group,
    members,
    permissions,
    loading,
    error,
    fetchGroupDetails,
    addMember,
    removeMember,
    setPermission,
    clearError: () => setError(null)
  };
};

export const useGroupStats = () => {
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/groups/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Erro ao carregar estatísticas');
      }
    } catch (err) {
      setError('Erro de conexão ao carregar estatísticas');
      console.error('Erro ao buscar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    clearError: () => setError(null)
  };
};
