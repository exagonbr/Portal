import { BaseApiService } from './base-api-service';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  permission?: {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
  };
}

export interface CreateRolePermissionDto {
  roleId: string;
  permissionId: string;
}

export interface UpdateRolePermissionDto {
  roleId?: string;
  permissionId?: string;
}

export interface RolePermissionsResponse {
  data: RolePermission[];
  total: number;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

class RolePermissionsService extends BaseApiService<RolePermission> {
  constructor() {
    super('/api/role-permissions');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<RolePermissionsResponse> {
    const response = await apiGet<RolePermissionsResponse>(`${this.basePath}?page=${page}&limit=${limit}`);
    return response;
  }

  async revokePermissionFromRole(roleId: string, permissionId: string): Promise<{ success: boolean }> {
    const response = await apiPost<{ success: boolean }>(`${this.basePath}/revoke`, { roleId, permissionId });
    return response;
  }

  async revokeAllPermissionsFromRole(roleId: string): Promise<{ success: boolean }> {
    const response = await apiDelete<{ success: boolean }>(`${this.basePath}/revoke-all/${roleId}`);
    return response;
  }

  async getAvailablePermissions(): Promise<Permission[]> {
    const response = await apiGet<Permission[]>(`${this.basePath}/available-permissions`);
    return response;
  }

  async getAvailableRoles(): Promise<Role[]> {
    const response = await apiGet<Role[]>(`${this.basePath}/available-roles`);
    return response;
  }

  async hasPermission(roleId: string, permissionId: string): Promise<boolean> {
    const response = await apiGet<{ hasPermission: boolean }>(`${this.basePath}/check/${roleId}/${permissionId}`);
    return response.hasPermission;
  }
}

export const rolePermissionsService = new RolePermissionsService(); 