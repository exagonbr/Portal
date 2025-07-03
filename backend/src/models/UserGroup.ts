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

export interface CreateUserGroupData {
  name: string;
  description?: string;
  color?: string;
  institution_id?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface UpdateUserGroupData {
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

export interface CreateGroupMemberData {
  group_id: string;
  user_id: string;
  role?: 'member' | 'admin';
  added_by: string;
}

export interface UpdateGroupMemberData {
  role?: 'member' | 'admin';
}

export interface GroupPermission {
  id: string;
  group_id: string;
  permission_key: string;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateGroupPermissionData {
  group_id: string;
  permission_key: string;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
}

export interface UpdateGroupPermissionData {
  allowed?: boolean;
  context_type?: 'global' | 'institution' | 'school';
  context_id?: string;
}

export interface ContextualPermission {
  id: string;
  user_id: string;
  permission_key: string;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
  source: 'direct' | 'group' | 'role';
  source_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateContextualPermissionData {
  user_id: string;
  permission_key: string;
  allowed: boolean;
  context_type: 'global' | 'institution' | 'school';
  context_id?: string;
  source: 'direct' | 'group' | 'role';
  source_id?: string;
}

export interface UpdateContextualPermissionData {
  allowed?: boolean;
  context_type?: 'global' | 'institution' | 'school';
  context_id?: string;
  source?: 'direct' | 'group' | 'role';
  source_id?: string;
}
