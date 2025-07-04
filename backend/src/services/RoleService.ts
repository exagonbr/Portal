import { AppDataSource } from '../config/typeorm.config';
import { Role } from '../entities/Role';
import { Repository } from 'typeorm';

export interface RoleResponseDto {
  id: number;
  authority?: string;
  displayName?: string;
  userCount: number;
}

export interface RoleFilterDto {
    page?: number;
    limit?: number;
    search?: string;
}

export class RoleService {
  private roleRepository: Repository<Role>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
  }

  async findRolesWithFilters(filters: RoleFilterDto): Promise<{ roles: RoleResponseDto[], total: number }> {
    const { page = 1, limit = 10, search } = filters;
    const queryBuilder = this.roleRepository.createQueryBuilder('role')
      .leftJoin('role.users', 'user')
      .addSelect('COUNT(user.id)', 'userCount')
      .groupBy('role.id');

    if (search) {
      queryBuilder.where('role.authority LIKE :search OR role.displayName LIKE :search', { search: `%${search}%` });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('role.authority', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const roles = await queryBuilder.getRawMany();

    const mappedRoles = roles.map(role => ({
        id: role.role_id,
        authority: role.role_authority,
        displayName: role.role_displayName,
        userCount: parseInt(role.userCount, 10) || 0,
    }));

    return { roles: mappedRoles, total };
  }

  async findRoleById(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({
        where: { id },
        relations: ['users']
    });
  }

  async createRole(data: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(data);
    return this.roleRepository.save(role);
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role | null> {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) {
      return null;
    }
    this.roleRepository.merge(role, data);
    return this.roleRepository.save(role);
  }

  async deleteRole(id: number): Promise<boolean> {
    const result = await this.roleRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}

export default new RoleService();