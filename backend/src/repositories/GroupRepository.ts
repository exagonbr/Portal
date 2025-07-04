import { BaseRepository } from './BaseRepository';
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


export interface CreateUserGroupData extends Omit<UserGroup, 'id' | 'member_count'> {}
export interface UpdateUserGroupData extends Partial<CreateUserGroupData> {}

export interface CreateGroupMemberData extends Omit<GroupMember, 'id' | 'joined_at'> {}

export class GroupRepository extends BaseRepository<UserGroup> {
  constructor() {
    super('user_groups');
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
}