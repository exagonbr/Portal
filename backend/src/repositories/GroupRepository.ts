import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
// Supondo que as entidades UserGroup, GroupMember, GroupPermission existam
// import { UserGroup, GroupMember, GroupPermission } from '../entities/UserGroup';

// Interfaces para desacoplar
export interface UserGroup {
    id: string;
    name: string;
    description: string;
    institution_id?: string;
    school_id?: string;
    is_active: boolean;
    member_count: number;
}
export interface GroupMember {
    id: string;
    group_id: string;
    user_id: string;
    role: 'admin' | 'member';
    joined_at: Date;
}
export interface GroupPermission {
    id: string;
    group_id: string;
    permission_key: string;
    allowed: boolean;
}

export interface GroupStats {
  total_groups: number;
  active_groups: number;
  total_members: number;
  permissions_count: number;
  by_institution: Record<string, number>;
  by_school: Record<string, number>;
}

export interface CreateUserGroupData extends Omit<UserGroup, 'id' | 'member_count'> {}
export interface UpdateUserGroupData extends Partial<CreateUserGroupData> {}

export interface CreateGroupMemberData extends Omit<GroupMember, 'id' | 'joined_at'> {}

export class GroupRepository extends BaseRepository<UserGroup> {
  constructor() {
    super('user_groups');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Group>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('group');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('group.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('group.id', 'DESC')
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
          SELECT * FROM group
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM group
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
      console.error(`Erro ao buscar registros de group:`, error);
      throw error;
    }
  }

  async findByName(name: string, institutionId?: string): Promise<UserGroup | null> {
    const filters: Partial<UserGroup> = { name } as Partial<UserGroup>;
    if (institutionId) {
      filters.institution_id = institutionId;
    }
    return this.findOne(filters);
  }

  async findByInstitution(institutionId: string): Promise<UserGroup[]> {
    return this.findAll({ institution_id: institutionId } as Partial<UserGroup>);
  }

  async findBySchool(schoolId: string): Promise<UserGroup[]> {
    return this.findAll({ school_id: schoolId } as Partial<UserGroup>);
  }

  async search(term: string, institutionId?: string): Promise<UserGroup[]> {
    let query = this.db(this.tableName)
      .where('name', 'ilike', `%${term}%`)
      .orWhere('description', 'ilike', `%${term}%`);
    
    if (institutionId) {
      query = query.andWhere({ institution_id: institutionId });
    }
    return query;
  }

  // Métodos para Membros
  async getMembers(groupId: string): Promise<GroupMember[]> {
    return this.db('group_members').where('group_id', groupId);
  }

  async addMember(groupId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<void> {
    await this.db('group_members').insert({ group_id: groupId, user_id: userId, role });
    await this.db(this.tableName).where({ id: groupId }).increment('member_count', 1);
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    await this.db('group_members').where({ group_id: groupId, user_id: userId }).del();
    await this.db(this.tableName).where({ id: groupId }).decrement('member_count', 1);
  }

  // Métodos para Permissões
  async getPermissions(groupId: string): Promise<GroupPermission[]> {
    return this.db('group_permissions').where('group_id', groupId);
  }

  async setPermission(groupId: string, permissionKey: string, allowed: boolean): Promise<void> {
    const existing = await this.db('group_permissions').where({ group_id: groupId, permission_key: permissionKey }).first();
    if (existing) {
      await this.db('group_permissions').where({ id: existing.id }).update({ allowed });
    } else {
      await this.db('group_permissions').insert({ group_id: groupId, permission_key: permissionKey, allowed });
    }
  }

  async getStats(): Promise<GroupStats> {
    // Obter total de grupos
    const totalGroups = await this.db(this.tableName).count('id as count').first();
    
    // Obter total de grupos ativos
    const activeGroups = await this.db(this.tableName).where({ is_active: true }).count('id as count').first();
    
    // Obter total de membros (soma de member_count)
    const totalMembers = await this.db(this.tableName).sum('member_count as sum').first();
    
    // Obter total de permissões
    const permissionsCount = await this.db('group_permissions').count('id as count').first();
    
    // Obter contagem por instituição
    const byInstitution = await this.db(this.tableName)
      .select('institution_id')
      .count('id as count')
      .whereNotNull('institution_id')
      .groupBy('institution_id');
    
    // Obter contagem por escola
    const bySchool = await this.db(this.tableName)
      .select('school_id')
      .count('id as count')
      .whereNotNull('school_id')
      .groupBy('school_id');
    
    // Formatar contagem por instituição
    const byInstitutionMap: Record<string, number> = {};
    byInstitution.forEach((item: any) => {
      byInstitutionMap[item.institution_id] = Number(item.count);
    });
    
    // Formatar contagem por escola
    const bySchoolMap: Record<string, number> = {};
    bySchool.forEach((item: any) => {
      bySchoolMap[item.school_id] = Number(item.count);
    });
    
    return {
      total_groups: Number(totalGroups?.count || 0),
      active_groups: Number(activeGroups?.count || 0),
      total_members: Number(totalMembers?.sum || 0),
      permissions_count: Number(permissionsCount?.count || 0),
      by_institution: byInstitutionMap,
      by_school: bySchoolMap
    };
  }
}