import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { RolePermissions } from '../entities/RolePermissions';

export class RolePermissionsRepository extends ExtendedRepository<RolePermissions> {
  private repository: Repository<RolePermissions>;
  
  constructor() {
    super('role_permissions');
    this.repository = AppDataSource.getRepository(RolePermissions);
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<RolePermissions>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('role_permissions');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('role_permissions.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('role_permissions.id', 'DESC')
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
          SELECT * FROM role_permissions
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM role_permissions
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
      console.error(`Erro ao buscar registros de role_permissions:`, error);
      throw error;
    }
  }
  
  async findAllActive(): Promise<RolePermissions[]> {
    if (this.repository) {
      return this.repository.find({
        where: { isActive: true },
        order: { createdAt: 'DESC' }
      });
    }
    return [];
  }

  async findByIdActive(id: number): Promise<RolePermissions | undefined> {
    if (this.repository) {
      return this.repository.findOne({
        where: { id, isActive: true }
      });
    }
    return undefined;
  }

  async softDelete(id: number): Promise<void> {
    if (this.repository) {
      await this.repository.update(id, { isActive: false });
    }
  }

  async searchByName(name: string): Promise<RolePermissions[]> {
    if (this.repository) {
      return this.repository.createQueryBuilder('role_permissions')
        .where('role_permissions.name ILIKE :name', { name: `%${name}%` })
        .andWhere('role_permissions.isActive = :isActive', { isActive: true })
        .getMany();
    }
    return [];
  }

  async findWithPagination(page: number = 1, limit: number = 10): Promise<{ data: RolePermissions[], total: number }> {
    if (this.repository) {
      const [data, total] = await this.repository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' }
      });
      return { data, total };
    }
    return { data: [], total: 0 };
  }
}