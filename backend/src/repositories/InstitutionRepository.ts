import { BaseRepository } from './BaseRepository';
import { Institution, CreateInstitutionData, UpdateInstitutionData } from '../models/Institution';

export class InstitutionRepository extends BaseRepository<Institution> {
  constructor() {
    super('institutions');
  }

  async findByCode(code: string): Promise<Institution | null> {
    return this.findOne({ code } as Partial<Institution>);
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

  async getInstitutionStats(institutionId: string): Promise<any> {
    const stats = await this.db.raw(`
      SELECT 
        i.name,
        i.type,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT c.id) as total_courses,
        COUNT(DISTINCT CASE WHEN u.role_id IN (SELECT id FROM roles WHERE name = 'student') THEN u.id END) as total_students,
        COUNT(DISTINCT CASE WHEN u.role_id IN (SELECT id FROM roles WHERE name = 'teacher') THEN u.id END) as total_teachers
      FROM institutions i
      LEFT JOIN users u ON i.id = u.institution_id
      LEFT JOIN courses c ON i.id = c.institution_id
      WHERE i.id = ?
      GROUP BY i.id, i.name, i.type
    `, [institutionId]);

    return stats.rows[0] || null;
  }
}
