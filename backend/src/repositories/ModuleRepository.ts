import { BaseRepository } from './BaseRepository';
import { Module, CreateModuleData, UpdateModuleData } from '../models/Module';

export class ModuleRepository extends BaseRepository<Module> {
  constructor() {
    super('modules');
  }

  async findByCourse(courseId: string): Promise<Module[]> {
    return this.db(this.tableName)
      .where('course_id', courseId)
      .orderBy('order', 'asc')
      .select('*');
  }

  async findByCourseId(courseId: string): Promise<Module[]> {
    return this.findByCourse(courseId);
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

  async getModuleLessons(moduleId: string): Promise<any[]> {
    return this.db('lessons')
      .where('module_id', moduleId)
      .orderBy('order', 'asc')
      .select('*');
  }

  async reorderModules(courseId: string, moduleOrders: { id: string; order: number }[]): Promise<void> {
    await this.executeTransaction(async (trx) => {
      for (const moduleOrder of moduleOrders) {
        await trx('modules')
          .where('id', moduleOrder.id)
          .andWhere('course_id', courseId)
          .update({ order: moduleOrder.order, updated_at: new Date() });
      }
    });
  }

  async getNextOrder(courseId: string): Promise<number> {
    const result = await this.db(this.tableName)
      .where('course_id', courseId)
      .max('order as max_order')
      .first();

    return (result?.max_order || 0) + 1;
  }

  async updateCompletion(id: string, isCompleted: boolean): Promise<Module | null> {
    return this.update(id, { is_completed: isCompleted } as Partial<Module>);
  }
}
