import { BaseRepository } from './BaseRepository';
import { Institution, CreateInstitutionData, UpdateInstitutionData } from '../models/Institution';

export class InstitutionRepository extends BaseRepository<Institution> {
  constructor() {
    super('institutions');
  }

  async findByCode(code: string): Promise<Institution | null> {
    return this.findOne({ code } as Partial<Institution>);
  }

  async findByEmail(email: string): Promise<Institution | null> {
    return this.findOne({ email } as Partial<Institution>);
  }

  async findByType(type: string): Promise<Institution[]> {
    return this.findAll({ type } as Partial<Institution>);
  }

  async createInstitution(data: CreateInstitutionData): Promise<Institution> {
    return this.create(data);
  }

  async updateInstitution(id: string, data: UpdateInstitutionData): Promise<Institution | null> {
    return this.update(id, data);
  }

  async deleteInstitution(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async searchInstitutions(searchTerm: string): Promise<Institution[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${searchTerm}%`)
      .orWhere('code', 'ilike', `%${searchTerm}%`)
      .select('*');
  }

  async findAllWithFilters(
    filters: { search?: string; type?: string; is_active?: boolean },
    pagination?: { page: number; limit: number },
    sortBy?: keyof Institution | undefined,
    sortOrder?: 'asc' | 'desc'
  ): Promise<Institution[]> {
    const query = this.db(this.tableName);

    if (filters.search) {
      query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('code', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.type) {
      query.where('type', filters.type);
    }

    if (filters.is_active !== undefined) {
      query.where('is_active', filters.is_active);
    }

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    if (sortBy && sortOrder) {
      query.orderBy(sortBy, sortOrder);
    } else {
      query.orderBy('created_at', 'desc'); // Default sort order
    }

    return query.select('*');
  }

  // Renomeado de getInstitutionStats e tipo de retorno ajustado
  async getStatistics(institutionId: string): Promise<{ totalStudents: number; totalTeachers: number; totalCourses: number; totalUsers: number; } | null> {
    // Nota: O DTO InstitutionStatsDto espera totalClasses, que não está nesta query.
    // A query atual retorna total_users, total_courses, total_students, total_teachers.
    // Vamos mapear para o que a query retorna e o serviço pode adaptar ou o DTO/query podem ser ajustados.
    const result = await this.db.raw(`
      SELECT
        COUNT(DISTINCT c.id) as "totalCourses",
        COUNT(DISTINCT CASE WHEN r.name = 'student' THEN u.id END) as "totalStudents",
        COUNT(DISTINCT CASE WHEN r.name = 'teacher' THEN u.id END) as "totalTeachers",
        COUNT(DISTINCT u.id) as "totalUsers"
        -- Adicionar totalClasses se necessário: COUNT(DISTINCT cl.id) as "totalClasses"
        -- LEFT JOIN classes cl ON i.id = cl.institution_id
      FROM institutions i
      LEFT JOIN users u ON i.id = u.institution_id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN courses c ON i.id = c.institution_id
      WHERE i.id = ?
      GROUP BY i.id
    `, [institutionId]);

    if (result.rows.length > 0) {
      const rawStats = result.rows[0];
      return {
        totalCourses: parseInt(rawStats.totalCourses, 10) || 0,
        totalStudents: parseInt(rawStats.totalStudents, 10) || 0,
        totalTeachers: parseInt(rawStats.totalTeachers, 10) || 0,
        totalUsers: parseInt(rawStats.totalUsers, 10) || 0,
        // totalClasses: parseInt(rawStats.totalClasses, 10) || 0, // Se adicionado à query
      };
    }
    return null;
  }
}
