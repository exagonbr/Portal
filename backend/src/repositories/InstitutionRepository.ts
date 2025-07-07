import { Institution } from '../entities';
import { BaseRepository } from './BaseRepository';
import { PaginationOptions } from '../types/pagination';

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

export interface InstitutionFilters {
  search?: string;
  state?: string;
  is_active?: boolean;
  has_student_platform?: boolean;
  has_principal_platform?: boolean;
  has_library_platform?: boolean;
}

export class InstitutionRepository extends BaseRepository<Institution> {
  constructor() {
    super('institution');
  }

  async findWithFilters(
    filters: InstitutionFilters,
    options: PaginationOptions
  ): Promise<{ items: Institution[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    const query = this.db(this.tableName).where((builder) => {
      if (filters.search) {
        builder.where('name', 'ilike', `%${filters.search}%`)
          .orWhere('company_name', 'ilike', `%${filters.search}%`)
          .orWhere('document', 'ilike', `%${filters.search}%`);
      }
      
      if (filters.state) {
        builder.where('state', '=', filters.state);
      }
      
      if (filters.is_active !== undefined) {
        builder.where('deleted', '=', !filters.is_active);
      }
      
      if (filters.has_student_platform !== undefined) {
        builder.where('has_student_platform', '=', filters.has_student_platform);
      }
      
      if (filters.has_principal_platform !== undefined) {
        builder.where('has_principal_platform', '=', filters.has_principal_platform);
      }
      
      if (filters.has_library_platform !== undefined) {
        builder.where('has_library_platform', '=', filters.has_library_platform);
      }
    });

    const total = await query.clone().count('id as count').first();
    const items = await query
      .orderBy('name', 'asc')
      .offset((page - 1) * limit)
      .limit(limit);

    return {
      items: items as Institution[],
      total: total ? Number(total.count) : 0
    };
  }

  async toggleStatus(id: string): Promise<Institution | null> {
    const institution = await this.findById(id);
    if (!institution) return null;
    return this.update(id, { deleted: !institution.deleted } as Partial<Institution>);
  }

  async getStats(id: string): Promise<any> {
    // Obter estatísticas da instituição
    const stats = await this.db
      .select(
        this.db.raw(`
          (SELECT COUNT(*) FROM "user" WHERE institution_id = ?) as total_users,
          (SELECT COUNT(*) FROM "class" WHERE institution_id = ?) as total_classes,
          (SELECT COUNT(*) FROM "schedule" WHERE institution_id = ?) as total_schedules
        `, [id, id, id])
      )
      .first();
      
    return stats;
  }

  async getUsers(id: string, options: PaginationOptions): Promise<{ items: any[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    
    const total = await this.db('user')
      .where('institution_id', id)
      .count('id as count')
      .first();
      
    const items = await this.db('user')
      .where('institution_id', id)
      .orderBy('name', 'asc')
      .offset((page - 1) * limit)
      .limit(limit)
      .select('*');
      
    return {
      items,
      total: total ? Number(total.count) : 0
    };
  }

  async getClasses(id: string, options: PaginationOptions): Promise<{ items: any[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    
    const total = await this.db('class')
      .where('institution_id', id)
      .count('id as count')
      .first();
      
    const items = await this.db('class')
      .where('institution_id', id)
      .orderBy('name', 'asc')
      .offset((page - 1) * limit)
      .limit(limit)
      .select('*');
      
    return {
      items,
      total: total ? Number(total.count) : 0
    };
  }

  async getSchedules(id: string, options: PaginationOptions): Promise<{ items: any[]; total: number }> {
    const { page = 1, limit = 10 } = options;
    
    const total = await this.db('schedule')
      .where('institution_id', id)
      .count('id as count')
      .first();
      
    const items = await this.db('schedule')
      .where('institution_id', id)
      .orderBy('created_at', 'desc')
      .offset((page - 1) * limit)
      .limit(limit)
      .select('*');
      
    return {
      items,
      total: total ? Number(total.count) : 0
    };
  }

  async getAnalytics(id: string): Promise<any> {
    // Obter dados analíticos da instituição
    const analytics = await this.db
      .select(
        this.db.raw(`
          (SELECT COUNT(*) FROM "user" WHERE institution_id = ? AND role = 'student') as student_count,
          (SELECT COUNT(*) FROM "user" WHERE institution_id = ? AND role = 'teacher') as teacher_count,
          (SELECT COUNT(*) FROM "class" WHERE institution_id = ? AND active = true) as active_classes,
          (SELECT COUNT(*) FROM "schedule" WHERE institution_id = ? AND date >= CURRENT_DATE) as upcoming_schedules
        `, [id, id, id, id])
      )
      .first();
      
    return analytics;
  }
}