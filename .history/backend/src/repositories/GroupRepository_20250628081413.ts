import { Knex } from 'knex';
import { 
  UserGroup, 
  CreateUserGroupData, 
  UpdateUserGroupData,
  GroupMember,
  CreateGroupMemberData,
  UpdateGroupMemberData,
  GroupPermission,
  CreateGroupPermissionData,
  UpdateGroupPermissionData,
  ContextualPermission,
  CreateContextualPermissionData,
  UpdateContextualPermissionData
} from '../models/UserGroup';

export class GroupRepository {
  constructor(private knex: Knex) {}

  // CRUD Grupos
  async findAll(filters?: {
    institution_id?: string;
    school_id?: string;
    is_active?: boolean;
    search?: string;
  }): Promise<UserGroup[]> {
    let query = this.knex('user_groups').select('*');

    if (filters) {
      if (filters.institution_id) {
        query = query.where('institution_id', filters.institution_id);
      }
      if (filters.school_id) {
        query = query.where('school_id', filters.school_id);
      }
      if (filters.is_active !== undefined) {
        query = query.where('is_active', filters.is_active);
      }
      if (filters.search) {
        query = query.where(function() {
          this.where('name', 'ilike', `%${filters.search}%`)
              .orWhere('description', 'ilike', `%${filters.search}%`);
        });
      }
    }

    return query.orderBy('name');
  }

  async findById(id: string): Promise<UserGroup | null> {
    const group = await this.knex('user_groups')
      .where('id', id)
      .first();
    
    return group || null;
  }

  async create(data: CreateUserGroupData): Promise<UserGroup> {
    const [group] = await this.knex('user_groups')
      .insert({
        ...data,
        is_active: data.is_active ?? true,
        member_count: 0
      })
      .returning('*');
    
    return group;
  }

  async update(id: string, data: UpdateUserGroupData): Promise<UserGroup | null> {
    const [group] = await this.knex('user_groups')
      .where('id', id)
      .update(data)
      .returning('*');
    
    return group || null;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.knex('user_groups')
      .where('id', id)
      .del();
    
    return deleted > 0;
  }

  // Membros do Grupo
  async findGroupMembers(groupId: string): Promise<GroupMember[]> {
    return this.knex('group_members')
      .select(
        'group_members.*',
        'users.name as user_name',
        'users.email as user_email',
        'users.role_id as user_role'
      )
      .leftJoin('users', 'group_members.user_id', 'users.id')
      .where('group_members.group_id', groupId)
      .orderBy('group_members.joined_at', 'desc');
  }

  async addGroupMember(data: CreateGroupMemberData): Promise<GroupMember> {
    const [member] = await this.knex('group_members')
      .insert({
        ...data,
        role: data.role || 'member'
      })
      .returning('*');
    
    return member;
  }

  async updateGroupMember(id: string, data: UpdateGroupMemberData): Promise<GroupMember | null> {
    const [member] = await this.knex('group_members')
      .where('id', id)
      .update(data)
      .returning('*');
    
    return member || null;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<boolean> {
    const deleted = await this.knex('group_members')
      .where('group_id', groupId)
      .where('user_id', userId)
      .del();
    
    return deleted > 0;
  }

  async isUserInGroup(groupId: string, userId: string): Promise<boolean> {
    const member = await this.knex('group_members')
      .where('group_id', groupId)
      .where('user_id', userId)
      .first();
    
    return !!member;
  }

  // Permissões do Grupo
  async findGroupPermissions(groupId: string): Promise<GroupPermission[]> {
    return this.knex('group_permissions')
      .where('group_id', groupId)
      .orderBy(['context_type', 'permission_key']);
  }

  async setGroupPermission(data: CreateGroupPermissionData): Promise<GroupPermission> {
    // Usar upsert (INSERT ... ON CONFLICT)
    const [permission] = await this.knex('group_permissions')
      .insert(data)
      .onConflict(['group_id', 'permission_key', 'context_type', 'context_id'])
      .merge(['allowed', 'updated_at'])
      .returning('*');
    
    return permission;
  }

  async removeGroupPermission(groupId: string, permissionKey: string, contextType: string, contextId?: string): Promise<boolean> {
    let query = this.knex('group_permissions')
      .where('group_id', groupId)
      .where('permission_key', permissionKey)
      .where('context_type', contextType);
    
    if (contextId) {
      query = query.where('context_id', contextId);
    } else {
      query = query.whereNull('context_id');
    }
    
    const deleted = await query.del();
    return deleted > 0;
  }

  // Permissões Contextuais
  async findUserContextualPermissions(userId: string): Promise<ContextualPermission[]> {
    return this.knex('contextual_permissions')
      .where('user_id', userId)
      .orderBy(['context_type', 'permission_key']);
  }

  async setContextualPermission(data: CreateContextualPermissionData): Promise<ContextualPermission> {
    // Usar upsert (INSERT ... ON CONFLICT)
    const [permission] = await this.knex('contextual_permissions')
      .insert(data)
      .onConflict(['user_id', 'permission_key', 'context_type', 'context_id', 'source', 'source_id'])
      .merge(['allowed', 'updated_at'])
      .returning('*');
    
    return permission;
  }

  async removeContextualPermission(
    userId: string, 
    permissionKey: string, 
    contextType: string, 
    contextId?: string
  ): Promise<boolean> {
    let query = this.knex('contextual_permissions')
      .where('user_id', userId)
      .where('permission_key', permissionKey)
      .where('context_type', contextType);
    
    if (contextId) {
      query = query.where('context_id', contextId);
    } else {
      query = query.whereNull('context_id');
    }
    
    const deleted = await query.del();
    return deleted > 0;
  }

  // Estatísticas
  async getGroupStats(): Promise<{
    total_groups: number;
    active_groups: number;
    total_members: number;
    permissions_count: number;
  }> {
    const stats = await this.knex('user_groups')
      .select(
        this.knex.raw('COUNT(*) as total_groups'),
        this.knex.raw('COUNT(*) FILTER (WHERE is_active = true) as active_groups'),
        this.knex.raw('SUM(member_count) as total_members')
      )
      .first();

    const permissionsCount = await this.knex('group_permissions')
      .count('* as count')
      .first();

    return {
      total_groups: parseInt(stats.total_groups) || 0,
      active_groups: parseInt(stats.active_groups) || 0,
      total_members: parseInt(stats.total_members) || 0,
      permissions_count: parseInt(permissionsCount.count) || 0
    };
  }

  // Buscar grupos de um usuário
  async findUserGroups(userId: string): Promise<UserGroup[]> {
    return this.knex('user_groups')
      .select('user_groups.*')
      .innerJoin('group_members', 'user_groups.id', 'group_members.group_id')
      .where('group_members.user_id', userId)
      .where('user_groups.is_active', true)
      .orderBy('user_groups.name');
  }

  // Buscar permissões efetivas de um usuário
  async calculateUserEffectivePermissions(
    userId: string, 
    contextType: string = 'global', 
    contextId?: string
  ): Promise<ContextualPermission[]> {
    let query = this.knex('contextual_permissions')
      .where('user_id', userId)
      .where('context_type', contextType);

    if (contextId) {
      query = query.where('context_id', contextId);
    } else {
      query = query.whereNull('context_id');
    }

    return query.orderBy(['permission_key', 'source']);
  }
}
