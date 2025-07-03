import { GroupRepository } from '../repositories/GroupRepository';
import { 
  UserGroup, 
  CreateUserGroupData, 
  UpdateUserGroupData,
  GroupMember,
  CreateGroupMemberData,
  GroupPermission,
  CreateGroupPermissionData,
  ContextualPermission,
  CreateContextualPermissionData
} from '../models/UserGroup';
import { RolePermissions } from '../types/roles';

export class GroupService {
  constructor(private groupRepository: GroupRepository) {}

  // CRUD Grupos
  async createGroup(data: CreateUserGroupData): Promise<UserGroup> {
    return this.groupRepository.create(data);
  }

  async getGroups(filters?: {
    institution_id?: string;
    school_id?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<UserGroup[]> {
    return this.groupRepository.findAll(filters);
  }

  async getGroupById(id: string): Promise<UserGroup | null> {
    return this.groupRepository.findById(id);
  }

  async updateGroup(id: string, data: UpdateUserGroupData): Promise<UserGroup | null> {
    return this.groupRepository.update(id, data);
  }

  async deleteGroup(id: string): Promise<boolean> {
    // Verificar se o grupo tem membros
    const members = await this.groupRepository.findGroupMembers(id);
    if (members.length > 0) {
      throw new Error('Não é possível excluir grupo com membros. Remova todos os membros primeiro.');
    }

    return this.groupRepository.delete(id);
  }

  // Gerenciamento de Membros
  async addMemberToGroup(groupId: string, userId: string, addedBy: string, role: 'member' | 'admin' = 'member'): Promise<GroupMember> {
    // Verificar se o grupo existe
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    // Verificar se o usuário já está no grupo
    const isAlreadyMember = await this.groupRepository.isUserInGroup(groupId, userId);
    if (isAlreadyMember) {
      throw new Error('Usuário já é membro deste grupo');
    }

    const memberData: CreateGroupMemberData = {
      group_id: groupId,
      user_id: userId,
      role,
      added_by: addedBy
    };

    return this.groupRepository.addGroupMember(memberData);
  }

  async removeMemberFromGroup(groupId: string, userId: string): Promise<boolean> {
    const isInGroup = await this.groupRepository.isUserInGroup(groupId, userId);
    if (!isInGroup) {
      throw new Error('Usuário não é membro deste grupo');
    }

    return this.groupRepository.removeGroupMember(groupId, userId);
  }

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    return this.groupRepository.findGroupMembers(groupId);
  }

  async bulkAddMembers(groupId: string, userIds: string[], addedBy: string): Promise<GroupMember[]> {
    const results: GroupMember[] = [];
    
    for (const userId of userIds) {
      try {
        const member = await this.addMemberToGroup(groupId, userId, addedBy);
        results.push(member);
      } catch (error) {
        console.warn(`Erro ao adicionar usuário ${userId} ao grupo ${groupId}:`, error);
        // Continuar com os próximos usuários
      }
    }

    return results;
  }

  // Gerenciamento de Permissões
  async setGroupPermission(
    groupId: string, 
    permissionKey: keyof RolePermissions, 
    allowed: boolean,
    contextType: 'global' | 'institution' | 'school' = 'global',
    contextId?: string
  ): Promise<GroupPermission> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error('Grupo não encontrado');
    }

    const permissionData: CreateGroupPermissionData = {
      group_id: groupId,
      permission_key: permissionKey,
      allowed,
      context_type: contextType,
      context_id: contextId
    };

    return this.groupRepository.setGroupPermission(permissionData);
  }

  async removeGroupPermission(
    groupId: string,
    permissionKey: keyof RolePermissions,
    contextType: 'global' | 'institution' | 'school' = 'global',
    contextId?: string
  ): Promise<boolean> {
    return this.groupRepository.removeGroupPermission(groupId, permissionKey, contextType, contextId);
  }

  async getGroupPermissions(groupId: string): Promise<GroupPermission[]> {
    return this.groupRepository.findGroupPermissions(groupId);
  }

  async bulkSetGroupPermissions(groupId: string, permissions: CreateGroupPermissionData[]): Promise<GroupPermission[]> {
    const results: GroupPermission[] = [];
    
    for (const permission of permissions) {
      try {
        const result = await this.groupRepository.setGroupPermission({
          ...permission,
          group_id: groupId
        });
        results.push(result);
      } catch (error) {
        console.warn(`Erro ao definir permissão ${permission.permission_key} para grupo ${groupId}:`, error);
      }
    }

    return results;
  }

  // Permissões Contextuais de Usuário
  async setUserContextualPermission(
    userId: string,
    permissionKey: keyof RolePermissions,
    allowed: boolean,
    contextType: 'global' | 'institution' | 'school' = 'global',
    contextId?: string,
    source: 'direct' | 'group' | 'role' = 'direct',
    sourceId?: string
  ): Promise<ContextualPermission> {
    const permissionData: CreateContextualPermissionData = {
      user_id: userId,
      permission_key: permissionKey,
      allowed,
      context_type: contextType,
      context_id: contextId,
      source,
      source_id: sourceId
    };

    return this.groupRepository.setContextualPermission(permissionData);
  }

  async getUserContextualPermissions(userId: string): Promise<ContextualPermission[]> {
    return this.groupRepository.findUserContextualPermissions(userId);
  }

  // Calcular Permissões Efetivas
  async calculateUserEffectivePermissions(
    userId: string,
    contextType: 'global' | 'institution' | 'school' = 'global',
    contextId?: string
  ): Promise<{ [key: string]: boolean }> {
    // 1. Buscar permissões base do role do usuário (implementar depois)
    // 2. Buscar permissões dos grupos do usuário
    // 3. Buscar permissões diretas do usuário
    // 4. Aplicar hierarquia de precedência

    const userGroups = await this.groupRepository.findUserGroups(userId);
    const directPermissions = await this.groupRepository.calculateUserEffectivePermissions(userId, contextType, contextId);
    
    const effectivePermissions: { [key: string]: boolean } = {};

    // Aplicar permissões dos grupos (menor precedência)
    for (const group of userGroups) {
      const groupPermissions = await this.groupRepository.findGroupPermissions(group.id);
      for (const permission of groupPermissions) {
        if (permission.context_type === contextType && 
            (permission.context_id === contextId || (!permission.context_id && !contextId))) {
          effectivePermissions[permission.permission_key] = permission.allowed;
        }
      }
    }

    // Aplicar permissões diretas (maior precedência)
    for (const permission of directPermissions) {
      effectivePermissions[permission.permission_key] = permission.allowed;
    }

    return effectivePermissions;
  }

  // Sincronizar permissões de grupo para membros
  async syncGroupPermissionsToMembers(groupId: string): Promise<void> {
    const members = await this.groupRepository.findGroupMembers(groupId);
    const groupPermissions = await this.groupRepository.findGroupPermissions(groupId);

    for (const member of members) {
      for (const permission of groupPermissions) {
        await this.groupRepository.setContextualPermission({
          user_id: member.user_id,
          permission_key: permission.permission_key,
          allowed: permission.allowed,
          context_type: permission.context_type,
          context_id: permission.context_id,
          source: 'group',
          source_id: groupId
        });
      }
    }
  }

  // Estatísticas
  async getGroupStats(): Promise<{
    total_groups: number;
    active_groups: number;
    total_members: number;
    permissions_count: number;
  }> {
    return this.groupRepository.getGroupStats();
  }

  // Buscar grupos por instituição/escola
  async getGroupsByInstitution(institutionId: string): Promise<UserGroup[]> {
    return this.groupRepository.findAll({ institution_id: institutionId });
  }

  async getGroupsBySchool(schoolId: string): Promise<UserGroup[]> {
    return this.groupRepository.findAll({ school_id: schoolId });
  }

  // Clonar grupo
  async cloneGroup(sourceGroupId: string, newName: string, newInstitutionId?: string, newSchoolId?: string): Promise<UserGroup> {
    const sourceGroup = await this.groupRepository.findById(sourceGroupId);
    if (!sourceGroup) {
      throw new Error('Grupo de origem não encontrado');
    }

    // Criar novo grupo
    const clonedGroup = await this.groupRepository.create({
      name: newName,
      description: `Cópia de: ${sourceGroup.description || sourceGroup.name}`,
      color: sourceGroup.color,
      institution_id: newInstitutionId || sourceGroup.institution_id,
      school_id: newSchoolId || sourceGroup.school_id,
      is_active: true
    });

    // Copiar permissões
    const sourcePermissions = await this.groupRepository.findGroupPermissions(sourceGroupId);
    await this.bulkSetGroupPermissions(clonedGroup.id, sourcePermissions.map(p => ({
      group_id: clonedGroup.id,
      permission_key: p.permission_key,
      allowed: p.allowed,
      context_type: p.context_type,
      context_id: p.context_id
    })));

    return clonedGroup;
  }
}
