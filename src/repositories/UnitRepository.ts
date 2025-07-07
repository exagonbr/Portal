import { BaseRepository } from './BaseRepository';
import { Unit } from '../entities/Unit';

export interface CreateUnitData {
  name: string;
  institutionId: number;
  institutionName?: string;
  deleted?: boolean;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}

export interface UnitFilters {
  search?: string;
  institutionId?: number;
  page?: number;
  limit?: number;
  sortBy?: keyof Unit;
  sortOrder?: 'asc' | 'desc';
}

export class UnitRepository extends BaseRepository<Unit> {
  constructor() {
    super('unit');
  }

  async findByName(name: string): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByInstitution(institutionId: number): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('institution_id', institutionId)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .orderBy('name', 'asc');
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.update(id, { deleted: true });
    return !!result;
  }

  async findWithFilters(filters: UnitFilters): Promise<{ data: Unit[], total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      institutionId
    } = filters;

    const query = this.db(this.tableName).select('*').where('deleted', false);
    const countQuery = this.db(this.tableName).count('* as total').first().where('deleted', false);

    if (search) {
      query.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('institution_name', 'ilike', `%${search}%`);
      });
      countQuery.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('institution_name', 'ilike', `%${search}%`);
      });
    }

    if (institutionId) {
      query.where('institution_id', institutionId);
      countQuery.where('institution_id', institutionId);
    }
    
    query.orderBy(sortBy, sortOrder).limit(limit).offset((page - 1) * limit);

    const [data, totalResult] = await Promise.all([query, countQuery]);
    
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    return { data, total };
  }

  async toggleStatus(id: string): Promise<Unit | null> {
    try {
      const unit = await this.findById(id);
      if (!unit) {
        return null;
      }

      const newDeletedStatus = !unit.deleted;
      const updatedUnit = await this.update(id, { deleted: newDeletedStatus } as UpdateUnitData);
      
      return updatedUnit;
    } catch (error) {
      console.error('Erro ao alternar status da Unit:', error);
      throw error;
    }
  }
} 