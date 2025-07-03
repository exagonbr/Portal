import { 
  EducationCycle, 
  CreateEducationCycleData, 
  UpdateEducationCycleData,
  ClassEducationCycle 
} from '../models/EducationCycle';
import { 
  EducationCycleFilterDto, 
  PaginatedEducationCyclesDto,
  EducationCycleWithClassesDto,
  CreateClassEducationCycleDto
} from '../dto/EducationCycleDto';
import { BaseRepository } from './BaseRepository';

export class EducationCycleRepository extends BaseRepository<EducationCycle> {
  constructor() {
    super('education_cycles');
  }

  override async create(data: CreateEducationCycleData): Promise<EducationCycle> {
    const [cycle] = await this.db(this.tableName)
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return cycle;
  }

  override async update(id: string, data: UpdateEducationCycleData): Promise<EducationCycle | null> {
    const [cycle] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return cycle || null;
  }

  async findByLevel(level: string): Promise<EducationCycle[]> {
    return await this.db(this.tableName)
      .where({ level })
      .orderBy('name');
  }

  async findWithPagination(filter: EducationCycleFilterDto): Promise<PaginatedEducationCyclesDto> {
    const { page = 1, limit = 10, search, level, sortBy = 'name', sortOrder = 'asc' } = filter;
    const offset = (page - 1) * limit;

    let query = this.db(this.tableName);
    let countQuery = this.db(this.tableName);

    // Aplicar filtros
    if (search) {
      query = query.where((builder) => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`);
      });
      countQuery = countQuery.where((builder) => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('description', 'ilike', `%${search}%`);
      });
    }

    if (level) {
      query = query.where({ level });
      countQuery = countQuery.where({ level });
    }

    // Obter total
    const countResult = await countQuery.count('* as count').first();
    const total = parseInt(countResult?.count as string, 10) || 0;

    // Obter dados paginados
    const education_cycles = await query
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      education_cycles,
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

  async getWithClasses(cycleId: string): Promise<EducationCycleWithClassesDto | null> {
    // Obter dados do ciclo
    const cycle = await this.findById(cycleId);
    if (!cycle) {
      return null;
    }

    // Obter turmas associadas
    const classes = await this.db('class_education_cycles')
      .select(
        'classes.id',
        'classes.name',
        'classes.code',
        'classes.year',
        'schools.name as school_name'
      )
      .join('classes', 'class_education_cycles.class_id', 'classes.id')
      .join('schools', 'classes.school_id', 'schools.id')
      .where('class_education_cycles.education_cycle_id', cycleId)
      .where('classes.is_active', true);

    // Contar total de alunos
    const studentsResult = await this.db('user_classes')
      .join('class_education_cycles', 'user_classes.class_id', 'class_education_cycles.class_id')
      .where('class_education_cycles.education_cycle_id', cycleId)
      .where('user_classes.role', 'STUDENT')
      .where('user_classes.is_active', true)
      .count('* as total')
      .first();

    // Contar total de professores
    const teachersResult = await this.db('user_classes')
      .join('class_education_cycles', 'user_classes.class_id', 'class_education_cycles.class_id')
      .where('class_education_cycles.education_cycle_id', cycleId)
      .where('user_classes.role', 'TEACHER')
      .where('user_classes.is_active', true)
      .count('* as total')
      .first();

    return {
      ...cycle,
      classes,
      total_students: parseInt(studentsResult?.total as string, 10) || 0,
      total_teachers: parseInt(teachersResult?.total as string, 10) || 0
    };
  }

  // Métodos para gerenciar associações com turmas
  async associateClass(data: CreateClassEducationCycleDto): Promise<ClassEducationCycle> {
    const [association] = await this.db('class_education_cycles')
      .insert({
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return association;
  }

  async disassociateClass(classId: string, cycleId: string): Promise<boolean> {
    const deletedRows = await this.db('class_education_cycles')
      .where({ class_id: classId, education_cycle_id: cycleId })
      .del();
    
    return deletedRows > 0;
  }

  async getClassCycles(classId: string): Promise<EducationCycle[]> {
    return await this.db('education_cycles')
      .select('education_cycles.*')
      .join('class_education_cycles', 'education_cycles.id', 'class_education_cycles.education_cycle_id')
      .where('class_education_cycles.class_id', classId);
  }

  async checkAssociationExists(classId: string, cycleId: string): Promise<boolean> {
    const existing = await this.db('class_education_cycles')
      .where({ class_id: classId, education_cycle_id: cycleId })
      .first();
    
    return !!existing;
  }
}