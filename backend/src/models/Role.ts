export interface Role {
  id: string;
  name: string;
  description?: string;
  type: 'system' | 'custom';
  user_count: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  type: 'system' | 'custom';
  user_count?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  type?: 'system' | 'custom';
  user_count?: number;
  status?: 'active' | 'inactive';
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePermissionData {
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  description?: string;
}

export interface UpdatePermissionData {
  name?: string;
  resource?: string;
  action?: 'create' | 'read' | 'update' | 'delete';
  description?: string;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
  created_at: Date;
  updated_at: Date;
}
