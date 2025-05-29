import { 
  UserClass, 
  CreateUserClassData, 
  UpdateUserClassData 
} from '../models/UserClass';
import { 
  UserClassFilterDto, 
  PaginatedUserClassesDto,
  UserClassWithDetailsDto,
  ClassEnrollmentSummaryDto,
  UserEnrollmentHistoryDto
} from '../dto/UserClassDto';
import { BaseRepository } from './BaseRepository';

export class UserClassRepository extends BaseRepository<UserClass> {
  constructor() {
    super('user_classes');
  }

  override async create(data: CreateUserClassData): Promise<UserClass> {
    const [userClass] = await this.db(this.tableName)
      .insert({
        ...data,
        enrollment_date: data.enrollment_date || new Date(),
        is_active: data.is_active ?? true,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return userClass;
  }

  override async update(id: string, data: UpdateUserClassData): Promise<UserClass | null> {
    const [userClass] = await this.db(this.tableName)
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    
    return userClass || null;
  }

  async findByUserAndClass(userId: string, classId: string, role?: string): Promise<UserClass | null> {
    let query = this.db(this.tableName)
      .where({ user_id: userId, class_id: classId });
    
    if (role) {
      query = query.where({ role });
    }
    
    const userClass = await query.first();
    return userClass || null;
  }

  async findActiveByUser(userId: string): Promise<UserClass[]> {
    return await this.db(this.tableName)
      .where({ user_id: userId, is_active: true })
      .orderBy('enrollment_date', 'desc');
  }

  async findActiveByClass(classId: string): Promise<UserClass[]> {
    return await this.db(this.tableName)
      .where({ class_id: classId, is_active: true })
      .orderBy('role')
      .orderBy('enrollment_date');
  }

  async findWithPagination(filter: UserClassFilterDto): Promise<PaginatedUserClassesDto> {
    const { 
      page = 1, 
      limit = 10, 
      user_id, 
      class_id, 
      role, 
      is_active, 
      school_id, 
      year,
      sortBy = 'enrollment_date', 
      sortOrder = 'desc' 
    } = filter;
    const offset = (page - 1) * limit;

    let query = this.db(this.tableName);
    let countQuery = this.db(this.tableName);

    // Aplicar filtros
    if (user_id) {
      query = query.where('user_classes.user_id', user_id);
      countQuery = countQuery.where('user_classes.user_id', user_id);
    }

    if (class_id) {
      query = query.where('user_classes.class_id', class_id);
      countQuery = countQuery.where('user_classes.class_id', class_id);
    }

    if (role) {
      query = query.where('user_classes.role', role);
      countQuery = countQuery.where('user_classes.role', role);
    }

    if (is_active !== undefined) {
      query = query.where('user_classes.is_active', is_active);
      countQuery = countQuery.where('user_classes.is_active', is_active);
    }

    // Filtros que requerem join com classes
    if (school_id || year !== undefined) {
      query = query
        .join('classes', 'user_classes.class_id', 'classes.id');
      countQuery = countQuery
        .join('classes', 'user_classes.class_id', 'classes.id');

      if (school_id) {
        query = query.where('classes.school_id', school_id);
        countQuery = countQuery.where('classes.school_id', school_id);
      }

      if (year !== undefined) {
        query = query.where('classes.year', year);
        countQuery = countQuery.where('classes.year', year);
      }
    }

    // Obter total
    const countResult = await countQuery.count('* as count').first();
    const total = parseInt(countResult?.count as string, 10) || 0;

    // Obter dados paginados
    const user_classes = await query
      .select('user_classes.*')
      .orderBy(`user_classes.${sortBy}`, sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      user_classes,
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

  async getWithDetails(userClassId: string): Promise<UserClassWithDetailsDto | null> {
    const result = await this.db(this.tableName)
      .select(
        'user_classes.*',
        'users.name as user_name',
        'users.email as user_email',
        'classes.name as class_name',
        'classes.code as class_code',
        'schools.name as school_name',
        'schools.id as school_id'
      )
      .join('users', 'user_classes.user_id', 'users.id')
      .join('classes', 'user_classes.class_id', 'classes.id')
      .join('schools', 'classes.school_id', 'schools.id')
      .where('user_classes.id', userClassId)
      .first();

    return result || null;
  }

  async getClassEnrollmentSummary(classId: string): Promise<ClassEnrollmentSummaryDto> {
    const classInfo = await this.db('classes')
      .where({ id: classId })
      .first();

    if (!classInfo) {
      throw new Error('Turma não encontrada');
    }

    // Contar por tipo de usuário
    const counts = await this.db(this.tableName)
      .select('role')
      .count('* as count')
      .where({ class_id: classId })
      .groupBy('role');

    const summary = {
      class_id: classId,
      class_name: classInfo.name,
      total_students: 0,
      total_teachers: 0,
      total_coordinators: 0,
      active_enrollments: 0,
      inactive_enrollments: 0
    };

    // Processar contagens por role
    for (const row of counts) {
      const count = parseInt(row.count as string, 10);
      switch (row.role) {
        case 'STUDENT':
          summary.total_students = count;
          break;
        case 'TEACHER':
          summary.total_teachers = count;
          break;
        case 'COORDINATOR':
          summary.total_coordinators = count;
          break;
      }
    }

    // Contar ativos e inativos
    const activeResult = await this.db(this.tableName)
      .where({ class_id: classId, is_active: true })
      .count('* as count')
      .first();

    const inactiveResult = await this.db(this.tableName)
      .where({ class_id: classId, is_active: false })
      .count('* as count')
      .first();

    summary.active_enrollments = parseInt(activeResult?.count as string, 10) || 0;
    summary.inactive_enrollments = parseInt(inactiveResult?.count as string, 10) || 0;

    return summary;
  }

  async getUserEnrollmentHistory(userId: string): Promise<UserEnrollmentHistoryDto> {
    const userInfo = await this.db('users')
      .where({ id: userId })
      .first();

    if (!userInfo) {
      throw new Error('Usuário não encontrado');
    }

    const enrollments = await this.db(this.tableName)
      .select(
        'user_classes.*',
        'classes.name as class_name',
        'schools.name as school_name'
      )
      .join('classes', 'user_classes.class_id', 'classes.id')
      .join('schools', 'classes.school_id', 'schools.id')
      .where('user_classes.user_id', userId)
      .orderBy('user_classes.enrollment_date', 'desc');

    return {
      user_id: userId,
      user_name: userInfo.name,
      enrollments: enrollments.map(e => ({
        class_id: e.class_id,
        class_name: e.class_name,
        school_name: e.school_name,
        role: e.role,
        enrollment_date: e.enrollment_date,
        exit_date: e.exit_date,
        is_active: e.is_active
      }))
    };
  }

  async deactivateEnrollment(userId: string, classId: string): Promise<boolean> {
    const updated = await this.db(this.tableName)
      .where({ user_id: userId, class_id: classId })
      .update({
        is_active: false,
        exit_date: new Date(),
        updated_at: new Date()
      });

    return updated > 0;
  }

  async checkEnrollmentExists(userId: string, classId: string, role: string): Promise<boolean> {
    const existing = await this.db(this.tableName)
      .where({ user_id: userId, class_id: classId, role })
      .first();
    
    return !!existing;
  }
}