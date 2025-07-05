import { BaseRepository } from './BaseRepository';
import { Class, ShiftType } from '../entities/Class';

export class ClassRepository extends BaseRepository<Class> {
  constructor() {
    super('classes');
  }

  async toggleStatus(id: string | number): Promise<Class | null> {
    const classData = await this.findById(id);
    if (!classData) return null;
    return this.update(id, { is_active: !classData.is_active } as Partial<Class>);
  }
}