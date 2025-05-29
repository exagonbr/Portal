import {
  School,
  CreateSchoolData,
  UpdateSchoolData
} from '../models/School';
import {
  SchoolFilterDto,
  PaginatedSchoolsDto,
  SchoolStatsDto
} from '../dto/SchoolDto';
import { BaseRepository } from './BaseRepository';

export class SchoolRepository extends BaseRepository<School> {
  constructor() {
    super('schools');
  }

  override async create(data: CreateSchoolData): Promise<School> {
    const [school] = await this.db(this.tableName)
      .insert({
        ...data,
        is_active: data.is_active ?? true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return school;
  }

  override async update(id: string, data: UpdateSchoolData): Promise<School | null> {
    const [school] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return school || null;
  }

  async findByCode(code: string): Promise<School | null> {
    const school = await this.db(this.tableName)
      .where({ code })
      .first();
    
    return school || null;
  }

  async findByInstitution(institutionId: string): Promise<School[]> {
    return await this.db(this.tableName)
      .where({ institution_id: institutionId })
      .orderBy('name');
  }

  async findWithPagination(filter: SchoolFilterDto): Promise<PaginatedSchoolsDto> {
    const { page = 1, limit = 10, search, institution_id, is_active, city, state, sortBy = 'name', sortOrder = 'asc' } = filter;
    const offset = (page - 1) * limit;

    let query = this.db(this.tableName);
    let countQuery = this.db(this.tableName);

    // Aplicar filtros
    if (search) {
      query = query.where((builder) => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`);
      });
      countQuery = countQuery.where((builder) => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`);
      });
    }

    if (institution_id) {
      query = query.where({ institution_id });
      countQuery = countQuery.where({ institution_id });
    }

    if (is_active !== undefined) {
      query = query.where({ is_active });
      countQuery = countQuery.where({ is_active });
    }

    if (city) {
      query = query.where('city', 'ilike', `%${city}%`);
      countQuery = countQuery.where('city', 'ilike', `%${city}%`);
    }

    if (state) {
      query = query.where({ state });
      countQuery = countQuery.where({ state });
    }

    // Obter total
    const countResult = await countQuery.count('* as count').first();
    const total = parseInt(countResult?.count as string, 10) || 0;

    // Obter dados paginados
    const schools = await query
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async getStats(schoolId: string): Promise<SchoolStatsDto> {
    // Total de alunos
    const studentsResult = await this.db('user_classes')
      .join('classes', 'user_classes.class_id', 'classes.id')
      .where('classes.school_id', schoolId)
      .where('user_classes.role', 'STUDENT')
      .where('user_classes.is_active', true)
      .count('* as totalStudents')
      .first();

    // Total de professores
    const teachersResult = await this.db('user_classes')
      .join('classes', 'user_classes.class_id', 'classes.id')
      .where('classes.school_id', schoolId)
      .where('user_classes.role', 'TEACHER')
      .where('user_classes.is_active', true)
      .count('* as totalTeachers')
      .first();

    // Total de turmas
    const classesResult = await this.db('classes')
      .where({ school_id: schoolId })
      .count('* as totalClasses')
      .first();

    // Total de gestores
    const managersResult = await this.db('school_managers')
      .where({ school_id: schoolId })
      .where({ is_active: true })
      .count('* as totalManagers')
      .first();

    // Turmas ativas
    const activeClassesResult = await this.db('classes')
      .where({ school_id: schoolId })
      .where({ is_active: true })
      .count('* as activeClasses')
      .first();

    return {
      totalStudents: parseInt(studentsResult?.totalStudents as string, 10) || 0,
      totalTeachers: parseInt(teachersResult?.totalTeachers as string, 10) || 0,
      totalClasses: parseInt(classesResult?.totalClasses as string, 10) || 0,
      totalManagers: parseInt(managersResult?.totalManagers as string, 10) || 0,
      activeClasses: parseInt(activeClassesResult?.activeClasses as string, 10) || 0
    };
  }

  async checkCodeUniqueness(code: string, excludeId?: string): Promise<boolean> {
    let query = this.db(this.tableName).where({ code });
    
    if (excludeId) {
      query = query.whereNot({ id: excludeId });
    }

    const existing = await query.first();
    return !existing;
  }
}