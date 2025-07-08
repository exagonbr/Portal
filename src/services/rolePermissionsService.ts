import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api-client' from './base-api-service';

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
    const response = await apiClient.post<any>(`${this.basePath}?page=${page}&limit=${limit}`, { roleId, permissionId });
    return response.data;
  }

  async revokePermissionFromRole(roleId: string, permissionId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<any>(`${this.basePath}/revoke`, { roleId, permissionIds });
    return response.data;
  }

  async revokeAllPermissionsFromRole(roleId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<any>(`${this.basePath}/revoke-all/${roleId}`);
    return response.data;
  }

  async getAvailablePermissions(): Promise<Permission[]> {
    const response = await fetch('/api/permissions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar permissões disponíveis');
    }

    return response.json();
  }

  async getAvailableRoles(): Promise<Role[]> {
    const response = await fetch('/api/roles', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar funções disponíveis');
    }

    return response.json();
  }

  async hasPermission(roleId: string, permissionId: string): Promise<boolean> {
    const response = await fetch(`${this.basePath}/has-permission?roleId=${roleId}&permissionId=${permissionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao verificar permissão');
    }

    const result = await response.json();
    return result.hasPermission;
  }
}

export const rolePermissionsService = new RolePermissionsService(); 