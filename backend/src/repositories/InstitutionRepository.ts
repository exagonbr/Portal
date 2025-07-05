import { Institution } from '../entities';
import { BaseRepository } from './BaseRepository';

// Interface para desacoplar
export interface Course {
    id: string;
    name: string;
    description: string;
    institution_id: string;
    teacher_id?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

export class InstitutionRepository extends BaseRepository<Institution> {
  constructor() {
    super('institutions');
  }

  async toggleStatus(id: string): Promise<Institution | null> {
    const institution = await this.findById(id);
    if (!institution) return null;
    return this.update(id, { is_active: !institution.deleted } as Partial<Institution>);
  }

}