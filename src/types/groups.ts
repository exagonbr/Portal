import { RolePermissions } from './roles';

export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  institution_id?: string;
  school_id?: string;
  is_active: boolean;
  member_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGroupData {
  name: string;
  description?: string;
  color?: string;
  institution_id?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
  color?: string;
  institution_id?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'admin';
  joined_at: Date;
  added_by: string;
}

export interface GroupMemberWithUser extends GroupMember {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AddGroupMemberData {
  user_id: string;
  role?: 'member' | 'admin';
}

export interface GroupPermission {
  id: string;
  group_id: string;
  permission_key: keyof RolePermissions;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SetGroupPermissionData {
  permission_key: keyof RolePermissions;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
}

export interface ContextualPermission {
  id: string;
  user_id: string;
  permission_key: keyof RolePermissions;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
  source: 'direct' | 'group' | 'role';
  source_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SetContextualPermissionData {
  user_id: string;
  permission_key: keyof RolePermissions;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
}

export interface PermissionMatrix {
  user_id: string;
  permissions: {
    [K in keyof RolePermissions]: {
      global: boolean;
      institutions: Record<string, boolean>;
      schools: Record<string, boolean>;
      source: 'role' | 'group' | 'direct';
      source_details?: string;
    };
  };
}

export interface GroupWithPermissions extends UserGroup {
  permissions: GroupPermission[];
  members: GroupMemberWithUser[];
}

export interface GroupFilter {
  institution_id?: string;
  school_id?: string;
  is_active?: boolean;
  search?: string;
}

export interface GroupStats {
  total_groups: number;
  active_groups: number;
  total_members: number;
  permissions_count: number;
  by_institution: Record<string, number>;
  by_school: Record<string, number>;
}

export interface PermissionContext {
  type: 'global' | 'institution' | 'school';
  id?: string;
  name: string;
}

export interface PermissionRule {
  permission_key: keyof RolePermissions;
  allowed: boolean;
  context: PermissionContext;
  source: 'role' | 'group' | 'direct';
  source_name: string;
  priority: number;
  inherited: boolean;
}

export interface UserEffectivePermissions {
  user_id: string;
  context: PermissionContext;
  permissions: RolePermissions;
  rules: PermissionRule[];
  last_calculated: Date;
}

export interface BulkGroupOperation {
  action: 'add_members' | 'remove_members' | 'set_permissions' | 'copy_permissions';
  group_id: string;
  user_ids?: string[];
  permissions?: SetGroupPermissionData[];
  source_group_id?: string;
}

export interface GroupTemplate {
  id: string;
  name: string;
  description: string;
  default_permissions: SetGroupPermissionData[];
  target_roles: string[];
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PermissionConflict {
  user_id: string;
  permission_key: keyof RolePermissions;
  context: PermissionContext;
  conflicts: {
    source: 'role' | 'group' | 'direct';
    source_id: string;
    source_name: string;
    allowed: boolean;
    priority: number;
  }[];
  resolved_value: boolean;
  resolution_reason: string;
}
