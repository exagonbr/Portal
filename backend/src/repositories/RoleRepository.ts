import { BaseRepository } from './BaseRepository';
import { Role } from '../entities/Role';
import { Permission } from '../models/Role'; // Supondo que Permission venha de um local diferente da entidade

export interface CreateRoleData extends Omit<Role, 'id' | 'users'> {}
export interface UpdateRoleData extends Partial<CreateRoleData> {}

export class RoleRepository extends BaseRepository<Role> {
  constructor() {
    super('role');
  }

  async createRole(data: CreateRoleData): Promise<Role> {
    return this.create(data);
  }

  async updateRole(id: number, data: UpdateRoleData): Promise<Role | null> {
    return this.update(id, data);
  }

  async deleteRole(id: number): Promise<boolean> {
    const userCount = await this.db('user').where('roleId', id).count('* as count').first();
    if (parseInt(userCount?.count as string, 10) > 0) {
      throw new Error('Não é possível deletar um papel que está sendo utilizado por usuários.');
    }
    // Também seria necessário remover as permissões associadas na tabela 'role_permissions'
    await this.db('role_permissions').where('role_id', id).del();
    return this.delete(id);
  }

  async findByAuthority(authority: string): Promise<Role | null> {
    return this.findOne({ authority } as Partial<Role>);
  }

  // A lógica de permissões requer uma tabela de junção (ex: role_permissions)
  // e uma tabela de permissões (ex: permissions)

  async getPermissions(roleId: number): Promise<Permission[]> {
    // return this.db('permissions')
    //   .select('permissions.*')
    //   .innerJoin('role_permissions', 'permissions.id', 'role_permissions.permission_id')
    //   .where('role_permissions.role_id', roleId);
    console.log(`Buscando permissões para o papel ${roleId}`);
    return [];
  }

  async addPermission(roleId: number, permissionId: number): Promise<void> {
    // await this.db('role_permissions').insert({ role_id: roleId, permission_id: permissionId });
    console.log(`Adicionando permissão ${permissionId} ao papel ${roleId}`);
  }

  async removePermission(roleId: number, permissionId: number): Promise<void> {
    // await this.db('role_permissions').where({ role_id: roleId, permission_id: permissionId }).del();
    console.log(`Removendo permissão ${permissionId} do papel ${roleId}`);
  }
}