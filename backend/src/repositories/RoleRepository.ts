import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Role } from '../entities/Role';

// Definindo um tipo Permission simples para evitar erros
export interface Permission {
  id: number;
  name: string;
  description?: string;
}

export interface CreateRoleData extends Omit<Role, 'id' | 'users'> {}
export interface UpdateRoleData extends Partial<CreateRoleData> {}

export class RoleRepository extends ExtendedRepository<Role> {
  constructor() {
    super('roles');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Role>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('role');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('role.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('role.id', 'DESC')
          .getManyAndCount();
          
        return {
          data,
          total,
          page,
          limit
        };
      } else {
        // Fallback para query raw
        const query = `
          SELECT * FROM role
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM role
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
        `;

        const [data, countResult] = await Promise.all([
          AppDataSource.query(query),
          AppDataSource.query(countQuery)
        ]);

        const total = parseInt(countResult[0].total);

        return {
          data,
          total,
          page,
          limit
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar registros de role:`, error);
      throw error;
    }
  }

  async createRole(data: CreateRoleData): Promise<Role> {
    return this.create(data);
  }

  async updateRole(id: number, data: UpdateRoleData): Promise<Role | null> {
    return this.update(id, data);
  }

  async deleteRole(id: number): Promise<boolean> {
    const userCount = await this.db('users').where('role_id', id).count('* as count').first();
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

  async toggleStatus(id: string): Promise<Role | null> {
    try {
      const role = await this.findById(id);
      if (!role) {
        return null;
      }

      const newActiveStatus = !role.isActive;
      const updatedRole = await this.update(parseInt(id), { isActive: newActiveStatus } as UpdateRoleData);
      
      return updatedRole;
    } catch (error) {
      console.error('Erro ao alternar status do Role:', error);
      throw error;
    }
  }
}