import { 
  Class, 
  CreateClassData, 
  UpdateClassData 
} from '../models/Class';
import { 
  ClassFilterDto, 
  PaginatedClassesDto,
  ClassStatsDto,
  ClassWithDetailsDto 
} from '../dto/ClassDto';
import { BaseRepository } from './BaseRepository';

export class ClassRepository extends BaseRepository<Class> {
  constructor() {
    super('classes');
  }

  override async create(data: CreateClassData): Promise<Class> {
    const [classEntity] = await this.db(this.tableName)
      .insert({
        ...data,
        max_students: data.max_students ?? 30,
        is_active: data.is_active ?? true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return classEntity;
  }

  override async update(id: string, data: UpdateClassData): Promise<Class | null> {
    const [classEntity] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return classEntity || null;
  }

  async findBySchool(schoolId: string): Promise<Class[]> {
    return await this.db(this.tableName)
      .where({ school_id: schoolId })
      .orderBy('year', 'desc')
      .orderBy('name');
  }

  async findByCodeAndSchool(code: string, schoolId: string, year: number): Promise<Class | null> {
    const classEntity = await this.db(this.tableName)
      .where({ code, school_id: schoolId, year })
      .first();
    
    return classEntity || null;
  }

  async findWithPagination(filter: ClassFilterDto): Promise<PaginatedClassesDto> {
    const { page = 1, limit = 10, search, school_id, year, shift, is_active, sortBy = 'name', sortOrder = 'asc' } = filter;
    const offset = (page - 1) * limit;

    let query = this.db(this.tableName);
    let countQuery = this.db(this.tableName);

    // Aplicar filtros
    if (search) {
      query = query.where((builder) => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`);
      });
      countQuery = countQuery.where((builder) => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`);
      });
    }

    if (school_id) {
      query = query.where({ school_id });
      countQuery = countQuery.where({ school_id });
    }

    if (year) {
      query = query.where({ year });
      countQuery = countQuery.where({ year });
    }

    if (shift) {
      query = query.where({ shift });
      countQuery = countQuery.where({ shift });
    }

    if (is_active !== undefined) {
      query = query.where({ is_active });
      countQuery = countQuery.where({ is_active });
    }

    // Obter total
    const countResult = await countQuery.count('* as count').first();
    const total = parseInt(countResult?.count as string, 10) || 0;

    // Obter dados paginados
    const classes = await query
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      classes,
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

  async getStats(classId: string): Promise<ClassStatsDto> {
    // Total de alunos
    const studentsResult = await this.db('user_classes')
      .where({ class_id: classId })
      .where({ role: 'STUDENT' })
      .where({ is_active: true })
      .count('* as totalStudents')
      .first();

    // Total de professores
    const teachersResult = await this.db('user_classes')
      .where({ class_id: classId })
      .where({ role: 'TEACHER' })
      .where({ is_active: true })
      .count('* as totalTeachers')
      .first();

    // Obter informações da turma para calcular taxa de ocupação
    const classInfo = await this.db(this.tableName)
      .where({ id: classId })
      .first();

    const totalStudents = parseInt(studentsResult?.totalStudents as string, 10) || 0;
    const totalTeachers = parseInt(teachersResult?.totalTeachers as string, 10) || 0;
    const maxStudents = classInfo?.max_students || 30;

    return {
      totalStudents,
      totalTeachers,
      averageStudents: totalStudents,
      occupancyRate: (totalStudents / maxStudents) * 100
    };
  }

  async getWithDetails(classId: string): Promise<ClassWithDetailsDto | null> {
    // Obter dados da turma com escola
    const classData = await this.db(this.tableName)
      .select(
        'classes.*',
        'schools.name as school_name'
      )
      .leftJoin('schools', 'classes.school_id', 'schools.id')
      .where('classes.id', classId)
      .first();

    if (!classData) {
      return null;
    }

    // Contar alunos
    const studentCountResult = await this.db('user_classes')
      .where({ class_id: classId })
      .where({ role: 'STUDENT' })
      .where({ is_active: true })
      .count('* as count')
      .first();

    // Contar professores
    const teacherCountResult = await this.db('user_classes')
      .where({ class_id: classId })
      .where({ role: 'TEACHER' })
      .where({ is_active: true })
      .count('* as count')
      .first();

    // Obter ciclos de ensino
    const educationCycles = await this.db('class_education_cycles')
      .select(
        'education_cycles.id',
        'education_cycles.name',
        'education_cycles.level'
      )
      .join('education_cycles', 'class_education_cycles.education_cycle_id', 'education_cycles.id')
      .where('class_education_cycles.class_id', classId);

    return {
      ...classData,
      student_count: parseInt(studentCountResult?.count as string, 10) || 0,
      teacher_count: parseInt(teacherCountResult?.count as string, 10) || 0,
      education_cycles: educationCycles
    };
  }

  async checkCodeUniqueness(code: string, schoolId: string, year: number, excludeId?: string): Promise<boolean> {
    let query = this.db(this.tableName)
      .where({ code, school_id: schoolId, year });
    
    if (excludeId) {
      query = query.whereNot({ id: excludeId });
    }

    const existing = await query.first();
    return !existing;
  }
}