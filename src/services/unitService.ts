import { CrudService } from './crudService';

export interface Unit {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  course_id?: number;
  order?: number;
  created_at: string;
  updated_at: string;
}

class UnitService extends CrudService<Unit> {
  constructor() {
    super('/units');
  }

  async reorder(id: number, newOrder: number) {
    const response = await this.update(id, { order: newOrder });
    return response;
  }

  async getByCourse(courseId: number) {
    const response = await this.getAll({ course_id: courseId });
    return response;
  }
}

export const unitService = new UnitService();