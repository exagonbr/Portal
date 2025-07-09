import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Unit } from '../entities/Unit';

export interface CreateUnitData {
  name: string;
  institutionId: number;
  institutionName?: string;
  type?: string;
  description?: string;
  status?: string;
  deleted?: boolean;
  dateCreated?: Date;
  lastUpdated?: Date;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}

export interface UnitFilters {
  search?: string;
  institution_id?: number;
  type?: string;
  active?: boolean;
  deleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: keyof Unit;
  sortOrder?: 'asc' | 'desc';
}

export class UnitRepository extends ExtendedRepository<Unit> {
  private repository: Repository<Unit>;
  constructor() {
    super("units");
    this.repository = AppDataSource.getRepository(Unit);
  }

  async findByNameAndInstitution(name: string, institutionId: number): Promise<Unit | null> {
    const result = await this.db(this.tableName)
      .where('name', 'ilike', name)
      .andWhere('institution_id', institutionId)
      .first();
    return result || null;
  }

  async findByInstitution(institutionId: number, includeInactive: boolean = false): Promise<Unit[]> {
    const query = this.db(this.tableName)
      .where('institution_id', institutionId);
    if (!includeInactive) {
      query.andWhere('deleted', false).andWhere('status', 'active');
    }
    return query.orderBy('name', 'asc');
  }

  async findActive(limit: number = 100): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .andWhere('status', 'active')
      .orderBy('name', 'asc')
      .limit(limit);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.update(id, {
      deleted: true,
      lastUpdated: new Date()
    } as UpdateUnitData);
    return !!result;
  }

  async findWithFilters(filters: UnitFilters): Promise<{ data: Unit[], total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      institution_id,
      type,
      active,
      deleted
    } = filters;
    const query = this.db(this.tableName).select('*');
    const countQuery = this.db(this.tableName).count('* as total').first();
    if (search) {
      query.where(function(this: any) {
        this.where('name', 'ilike', `%${search}%`)
            .orWhere('institution_name', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`);
      });
      countQuery.where(function(this: any) {
        this.where('name', 'ilike', `%${search}%`)
            .orWhere('institution_name', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`);
      });
    }
    if (institution_id !== undefined) {
      query.where('institution_id', institution_id);
      countQuery.where('institution_id', institution_id);
    }
    if (type) {
      query.where('type', 'ilike', type);
      countQuery.where('type', 'ilike', type);
    }
    if (active !== undefined) {
      if (active) {
        query.where('status', 'active').andWhere('deleted', false);
        countQuery.where('status', 'active').andWhere('deleted', false);
      } else {
        query.where(function(this: any) {
          this.where('status', '!=', 'active').orWhere('deleted', true);
        });
        countQuery.where(function(this: any) {
          this.where('status', '!=', 'active').orWhere('deleted', true);
        });
      }
    }
    if (deleted !== undefined) {
      query.where('deleted', deleted);
      countQuery.where('deleted', deleted);
    }
    const validSortColumns = ['id', 'name', 'institution_name', 'type', 'status', 'date_created', 'last_updated'];
    const safeSortBy = validSortColumns.includes(sortBy as string) ? sortBy : 'name';
    query.orderBy(safeSortBy as string, sortOrder).limit(limit).offset((page - 1) * limit);
    const [data, totalResult] = await Promise.all([query, countQuery]);
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;
    return { data, total };
  }

  async toggleStatus(id: string): Promise<Unit | null> {
    const unit = await this.findById(id);
    if (!unit) return null;
    const newStatus = unit.status === 'active' ? 'inactive' : 'active';
    const updatedUnit = await this.update(id, {
      status: newStatus,
      lastUpdated: new Date()
    } as UpdateUnitData);
    return updatedUnit;
  }

  async existsByNameAndInstitution(name: string, institutionId: number, excludeId?: string | number): Promise<boolean> {
    const query = this.db(this.tableName)
      .where('name', 'ilike', name)
      .andWhere('institution_id', institutionId);
    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }
    const result = await query.first();
    return !!result;
  }

  async findByName(name: string, limit: number = 10): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('deleted', false)
      .andWhere('status', 'active')
      .orderBy('name', 'asc')
      .limit(limit);
  }

  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Unit>> {
    const { page = 1, limit = 10, search } = options;
    const { data, total } = await this.findWithFilters({ page, limit, search });
    return { data, total, page, limit };
  }
} 
