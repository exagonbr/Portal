import { BaseRepository } from './BaseRepository';
import { ShiftType } from '../entities/Class'; // Supondo que a entidade Class e o tipo ShiftType existam

// Interface para desacoplar
export interface Class {
    id: string;
    name: string;
    code: string;
    school_id: string;
    year: number;
    shift: ShiftType;
    max_students: number;
    is_active: boolean;
    students_count: number;
    teacher_name?: string;
    created_at: Date;
    updated_at: Date;
}

export class ClassRepository extends BaseRepository<Class> {
  constructor() {
    super('classes');
  }

  async toggleStatus(id: string): Promise<Class | null> {
    const classData = await this.findById(id);
    if (!classData) return null;
    return this.update(id, { is_active: !classData.is_active } as Partial<Class>);
  }
}