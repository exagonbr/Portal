import { BaseRepository } from './BaseRepository';
import { Module } from '../entities/Module';

export interface CreateModuleData extends Omit<Module, 'id' | 'created_at' | 'updated_at' | 'collection' | 'videos'> {}
export interface UpdateModuleData extends Partial<CreateModuleData> {}

export class ModuleRepository extends BaseRepository<Module> {
  constructor() {
    super('modules');
  }

  async createModule(data: CreateModuleData): Promise<Module> {
    return this.create(data);
  }

  async updateModule(id: string, data: UpdateModuleData): Promise<Module | null> {
    return this.update(id, data);
  }

  async deleteModule(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async findByCollection(collectionId: string): Promise<Module[]> {
    return this.db(this.tableName)
      .where('collection_id', collectionId)
      .orderBy('order', 'asc');
  }

  async getNextOrder(collectionId: string): Promise<number> {
    const result = await this.db(this.tableName)
      .where('collection_id', collectionId)
      .max('order as max_order')
      .first();

    return (result?.max_order || 0) + 1;
  }

  async reorderModules(collectionId: string, moduleOrders: { id: string; order: number }[]): Promise<void> {
    await this.executeTransaction(async (trx) => {
      for (const moduleOrder of moduleOrders) {
        await trx(this.tableName)
          .where({ id: moduleOrder.id, collection_id: collectionId })
          .update({ order: moduleOrder.order });
      }
    });
  }
}