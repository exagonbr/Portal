import { BaseRepository } from './BaseRepository';
import { Unit } from '../entities/Unit';

export interface CreateUnitData {
  name: string;
  institutionId: number;
  institutionName?: string;
  deleted?: boolean;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}

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
} 