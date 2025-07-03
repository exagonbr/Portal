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
    // Map is_active to status
    const dbData: any = { ...data };
    if (dbData.is_active !== undefined) {
      dbData.status = dbData.is_active ? 'active' : 'inactive';
      delete dbData.is_active;
    }
    
    const result = await this.create(dbData);
    // Map status back to is_active in the result
    return this.mapToModel(result);
  }

  async updateInstitution(id: string, data: UpdateInstitutionData): Promise<Institution | null> {
    // Map is_active to status
    const dbData: any = { ...data };
    if (dbData.is_active !== undefined) {
      dbData.status = dbData.is_active ? 'active' : 'inactive';
      delete dbData.is_active;
    }
    
    const result = await this.update(id, dbData);
    // Map status back to is_active in the result
    return result ? this.mapToModel(result) : null;
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
      // Map is_active boolean to status string
      const status = filters.is_active ? 'active' : 'inactive';
      query.where('status', status);
    }

    if (pagination) {
      query.limit(pagination.limit).offset((pagination.page - 1) * pagination.limit);
    }

    if (sortBy && sortOrder) {
      // Mapear campos que podem ter nomes diferentes na tabela
      let dbSortBy = sortBy;
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        // Verificar se as colunas existem, senão usar alternativas
        dbSortBy = sortBy;
      }
      query.orderBy(dbSortBy as string, sortOrder);
    } else {
      // Usar uma coluna que sabemos que existe
      query.orderBy('name', 'asc'); // Default sort order por nome
    }

    const results = await query.select('*');
    // Map each result from DB format to model format
    return results.map(this.mapToModel);
  }

  // Helper method to map database record to model
  private mapToModel(record: any): Institution {
    if (!record) return record;
    
    const model: any = { ...record };
    // Map status to is_active
    if (record.status !== undefined) {
      model.is_active = record.status === 'active';
      delete model.status;
    }
    
    return model as Institution;
  }

  // Override the base methods to handle the mapping
  async findById(id: string): Promise<Institution | null> {
    const result = await super.findById(id);
    return result ? this.mapToModel(result) : null;
  }

  async findOne(filters: Partial<Institution>): Promise<Institution | null> {
    // Map is_active to status in filters if present
    const dbFilters: any = { ...filters };
    if (dbFilters.is_active !== undefined) {
      dbFilters.status = dbFilters.is_active ? 'active' : 'inactive';
      delete dbFilters.is_active;
    }
    
    const result = await super.findOne(dbFilters);
    return result ? this.mapToModel(result) : null;
  }

  async findAll(filters?: Partial<Institution>, pagination?: { page: number; limit: number }): Promise<Institution[]> {
    // Map is_active to status in filters if present
    let dbFilters: any = undefined;
    if (filters) {
      dbFilters = { ...filters };
      if (dbFilters.is_active !== undefined) {
        dbFilters.status = dbFilters.is_active ? 'active' : 'inactive';
        delete dbFilters.is_active;
      }
    }
    
    const results = await super.findAll(dbFilters, pagination);
    return results.map(this.mapToModel);
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
