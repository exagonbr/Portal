export interface CreateRoleDto {
  name: string;
  description?: string;
  type: 'system' | 'custom';
  permissions: string[];
  status?: 'active' | 'inactive';
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive';
  permissions?: string[];
}

export interface RoleFilterDto {
  type?: 'system' | 'custom';
  status?: 'active' | 'inactive';
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'user_count';
  sortOrder?: 'asc' | 'desc';
}

export interface RolePermissionsDto {
  permissions: string[];
}

export interface RoleResponseDto {
  id: string;
  name: string;
  description?: string;
  type: 'system' | 'custom';
  status: 'active' | 'inactive';
  user_count: number;
  permissions: PermissionResponseDto[];
  created_at: Date;
  updated_at: Date;
}

export interface PermissionResponseDto {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface RoleStatsDto {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  activeRoles: number;
  inactiveRoles: number;
  totalUsers: number;
}

// Para integração com o frontend refatorado
export interface RolePermissionGroupDto {
  id: string;
  name: string;
  description: string;
  permissions: FrontendPermissionDto[];
}

export interface FrontendPermissionDto {
  key: string;
  name: string;
  description: string;
  category: string;
  value: boolean;
}

export interface ExtendedRoleDto {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: { [key: string]: boolean };
  userCount: number;
  status: 'active' | 'inactive';
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomRoleDto {
  id: string;
  name: string;
  description: string;
  type: 'custom';
  permissions: { [key: string]: boolean };
  userCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
} 