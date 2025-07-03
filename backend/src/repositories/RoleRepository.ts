import { BaseRepository } from './BaseRepository';
import { Role, CreateRoleData, UpdateRoleData, Permission, CreatePermissionData, UpdatePermissionData } from '../models/Role';

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super('roles');
  }

  async findByType(type: 'system' | 'custom'): Promise<Role[]> {
    return this.findAll({ type } as Partial<Role>);
  }

  async findByStatus(status: 'active' | 'inactive'): Promise<Role[]> {
    return this.findAll({ status } as Partial<Role>);
  }

  async createRole(data: CreateRoleData): Promise<Role> {
    return this.create(data);
  }

  async updateRole(id: string, data: UpdateRoleData): Promise<Role | null> {
    return this.update(id, data);
  }

  async deleteRole(id: string): Promise<boolean> {
    // Check if role is being used by any users
    const usersWithRole = await this.db.queryBuilder().from('users').where('role_id', id).count('* as count').first();
    const userCount = parseInt(usersWithRole?.count as string) || 0;

    if (userCount > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    return this.delete(id);
  }

  async updateUserCount(roleId: string): Promise<void> {
    const result = await this.db.queryBuilder().from('users').where('role_id', roleId).count('* as count').first();
    const userCount = parseInt(result?.count as string) || 0;

    await this.update(roleId, { user_count: userCount } as Partial<Role>);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    return this.db.queryBuilder().from('permissions')
      .select('permissions.*')
      .innerJoin('role_permissions', 'permissions.id', 'role_permissions.permission_id')
      .where('role_permissions.role_id', roleId);
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.db.queryBuilder().from('role_permissions').insert({
      role_id: roleId,
      permission_id: permissionId,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    const deletedRows = await this.db.queryBuilder().from('role_permissions')
      .where({ role_id: roleId, permission_id: permissionId })
      .del();
    return deletedRows > 0;
  }

  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.executeTransaction(async (trx) => {
      // Remove existing permissions
      await trx.queryBuilder().from('role_permissions').where('role_id', roleId).del();

      // Add new permissions
      if (permissionIds.length > 0) {
        const rolePermissions = permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx.queryBuilder().from('role_permissions').insert(rolePermissions);
      }
    });
  }

  async getRoleWithPermissions(id: string): Promise<any | null> {
    const role = await this.findById(id);
    if (!role) return null;

    const permissions = await this.getRolePermissions(id);

    return {
      ...role,
      permissions
    };
  }

  async searchRoles(searchTerm: string): Promise<Role[]> {
    return this.db.queryBuilder().from(this.tableName)
      .where('name', 'ilike', `%${searchTerm}%`)
      .orWhere('description', 'ilike', `%${searchTerm}%`)
      .select('*');
  }
}

export class PermissionRepository extends BaseRepository<Permission> {
  constructor() {
    super('permissions');
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.findAll({ resource } as Partial<Permission>);
  }

  async findByAction(action: 'create' | 'read' | 'update' | 'delete'): Promise<Permission[]> {
    return this.findAll({ action } as Partial<Permission>);
  }

  async createPermission(data: CreatePermissionData): Promise<Permission> {
    return this.create(data);
  }

  async updatePermission(id: string, data: UpdatePermissionData): Promise<Permission | null> {
    return this.update(id, data);
  }

  async deletePermission(id: string): Promise<boolean> {
    // Check if permission is being used by any roles
    const rolesWithPermission = await this.db.queryBuilder().from('role_permissions')
      .where('permission_id', id)
      .count('* as count')
      .first();
    const roleCount = parseInt(rolesWithPermission?.count as string) || 0;

    if (roleCount > 0) {
      throw new Error('Cannot delete permission that is assigned to roles');
    }

    return this.delete(id);
  }

  async getPermissionRoles(permissionId: string): Promise<Role[]> {
    return this.db.queryBuilder().from('roles')
      .select('roles.*')
      .innerJoin('role_permissions', 'roles.id', 'role_permissions.role_id')
      .where('role_permissions.permission_id', permissionId);
  }

  async searchPermissions(searchTerm: string): Promise<Permission[]> {
    return this.db.queryBuilder().from(this.tableName)
      .where('name', 'ilike', `%${searchTerm}%`)
      .orWhere('resource', 'ilike', `%${searchTerm}%`)
      .orWhere('description', 'ilike', `%${searchTerm}%`)
      .select('*');
  }

  async getResourcePermissions(resource: string): Promise<Permission[]> {
    return this.findByResource(resource);
  }

  async checkUserPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const result = await this.db.raw(`
      SELECT COUNT(*) as count
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      INNER JOIN role_permissions rp ON r.id = rp.role_id
      INNER JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ? AND p.resource = ? AND p.action = ? AND r.status = 'active'
    `, [userId, resource, action]);

    const count = parseInt(result.rows[0]?.count || '0');
    return count > 0;
  }
}
