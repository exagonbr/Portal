import { Course } from '../models/Course';

import { CourseRepository } from '../repositories/CourseRepository';
import { UserRepository } from '../repositories/UserRepository'; // Para buscar detalhes de usuários
import { ModuleRepository } from '../repositories/ModuleRepository'; // Para buscar módulos
// Outros repositórios como BookRepository, VideoRepository podem ser necessários

import { BaseService } from '../common/BaseService';
import { 
  CreateCourseDto, 
  UpdateCourseDto, 
  CourseDto,
  CourseFilterDto,
  PaginatedCoursesDto,
  AddRemoveTeacherStudentDto,
  UpdateStudentProgressDto
} from '../dto/CourseDto';
import { UserResponseDto } from '../dto/UserDto'; // Para mapear usuários para DTO
import { ModuleDto } from '../dto/ModuleDto'; // Para mapear módulos para DTO
// DTOs para Book e Video seriam necessários se retornados em detalhes do curso

import { ServiceResult } from '../types/common';
// import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from '../utils/errors'; // Supondo erros customizados

export class CourseService extends BaseService<Course, CreateCourseDto, UpdateCourseDto> {
  private courseRepository: CourseRepository;
  private userRepository: UserRepository; // Exemplo de outro repositório
  private moduleRepository: ModuleRepository; // Exemplo

  constructor() {
    const courseRepository = new CourseRepository();
    super(courseRepository, 'Course');
    this.courseRepository = courseRepository;
    this.userRepository = new UserRepository(); // Instanciar conforme necessário
    this.moduleRepository = new ModuleRepository(); // Instanciar conforme necessário
  }

  private async mapToDto(course: Course, includeDetails: boolean = false): Promise<CourseDto> {
    const institution = course.institution_id ? await this.courseRepository.getInstitutionForCourse(course.institution_id) : undefined;
    
    let modulesDto: ModuleDto[] | undefined = undefined;
    let teachersDto: UserResponseDto[] | undefined = undefined;

    if (includeDetails) {
        const modules = await this.moduleRepository.findByCourseId(course.id);
        modulesDto = modules.map(m => ({ // Mapeamento simples, idealmente ModuleService.mapToDto
            id: m.id,
            name: m.name,
            description: m.description || '',
            order: m.order,
            xp_reward: m.xp_reward,
            is_completed: m.is_completed,
            prerequisites: m.prerequisites || [],
            course_id: m.course_id,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }));

        const teachers = await this.courseRepository.getCourseTeachers(course.id);
        teachersDto = teachers.map(t => ({ 
          id: t.id,
          name: t.name,
          email: t.email,
          role_id: (t as any).role_id || '',
          institution_id: (t as any).institution_id,
          endereco: (t as any).endereco,
          telefone: (t as any).telefone,
          school_id: (t as any).school_id,
          is_active: (t as any).is_active ?? true,
          created_at: t.created_at,
          updated_at: t.updated_at
        }));
    }
    
    const dto: CourseDto = {
      id: course.id,
      name: course.name,
      level: course.level,
      cycle: course.cycle,
      institution_id: course.institution_id,
      created_at: course.created_at,
      updated_at: course.updated_at,
    };

    // Adicionar campos opcionais apenas se existirem
    if (course.description) dto.description = course.description;
    if (course.stage) dto.stage = course.stage;
    if (course.duration) dto.duration = course.duration;
    if (course.schedule) dto.schedule = course.schedule;
    
    if (institution) {
      dto.institution = {
        id: institution.id,
        name: institution.name,
        code: institution.code,
        type: institution.type,
        is_active: (institution as any).is_active,
        created_at: institution.created_at,
        updated_at: institution.updated_at,
      };
    }
    
    if (modulesDto) dto.modules = modulesDto;
    if (teachersDto) dto.teachers = teachersDto;

    return dto;
  }

  async findCoursesWithFilters(filters: CourseFilterDto): Promise<ServiceResult<PaginatedCoursesDto>> {
    this.logger.debug('Finding courses with filters', { filters });
    try {
      const { page = 1, limit = 10, sortBy, sortOrder, search, institution_id, level, cycle, stage } = filters;
      
      const queryFilters: any = {};
      if (search) queryFilters.search = search;
      if (institution_id) queryFilters.institution_id = institution_id;
      if (level) queryFilters.level = level;
      if (cycle) queryFilters.cycle = cycle;
      if (stage) queryFilters.stage = stage;

      // Validar sortBy
      let validSortBy: keyof Course | undefined = undefined;
      if (sortBy) {
        const courseModelKeys: Array<keyof Course> = ['id', 'name', 'level', 'cycle', 'stage', 'duration', 'institution_id', 'created_at', 'updated_at'];
        if (courseModelKeys.includes(sortBy as keyof Course)) {
          validSortBy = sortBy as keyof Course;
        } else {
            this.logger.warn(`Invalid sortBy field for Course: ${sortBy}`);
        }
      }

      const total = await this.courseRepository.countCourses(queryFilters); // Precisa de countCourses
      const courses = await this.courseRepository.findAllWithFilters( // Precisa de findAllWithFilters
        queryFilters,
        { page, limit },
        validSortBy,
        sortOrder
      );

      const coursesDto = await Promise.all(courses.map(course => this.mapToDto(course, false))); // false para não carregar todos os detalhes na lista

      const paginationResult = this.calculatePagination(total, page, limit);

      return {
        success: true,
        data: {
          courses: coursesDto,
          pagination: paginationResult,
        },
      };
    } catch (error) {
      this.logger.error('Error finding courses with filters', { filters }, error as Error);
      return { success: false, error: 'Failed to retrieve courses' };
    }
  }

  async findCourseDetails(id: string): Promise<ServiceResult<CourseDto>> {
    this.logger.debug('Finding course details by ID', { id });
    const result = await super.findById(id); // BaseService.findById retorna ServiceResult<Course>
    if (!result.success || !result.data) {
      return { success: false, error: result.error || 'Course not found', errors: result.errors || [] };
    }
    return { success: true, data: await this.mapToDto(result.data, true) }; // true para carregar detalhes
  }

  async createCourse(data: CreateCourseDto, userId?: string): Promise<ServiceResult<CourseDto>> {
    this.logger.debug('Creating course', { data, userId });
    // Adicionar validações específicas se necessário (ex: verificar se institution_id existe)
    const result = await super.create(data, userId); // BaseService.create retorna ServiceResult<Course>
    if (!result.success || !result.data) {
      return result;
    }
    return { success: true, data: await this.mapToDto(result.data) };
  }

  async updateCourse(id: string, data: UpdateCourseDto, userId?: string): Promise<ServiceResult<CourseDto>> {
    this.logger.debug('Updating course', { id, data, userId });
    // Adicionar validações específicas
    const result = await super.update(id, data, userId); // BaseService.update retorna ServiceResult<Course>
    if (!result.success || !result.data) {
      return result;
    }
    return { success: true, data: await this.mapToDto(result.data) };
  }

  async deleteCourse(id: string, userId?: string): Promise<ServiceResult<boolean>> {
    this.logger.debug('Deleting course', { id, userId });
    // Adicionar validações (ex: verificar se há alunos matriculados)
    return super.delete(id, userId);
  }

  // --- Métodos para entidades relacionadas ---

  async getCourseModules(courseId: string): Promise<ServiceResult<ModuleDto[]>> {
    this.logger.debug('Getting modules for course', { courseId });
    try {
      const courseExists = await this.courseRepository.findById(courseId);
      if (!courseExists) return { success: false, error: 'Course not found' };
      
      const modules = await this.moduleRepository.findByCourseId(courseId);
      const modulesDto = modules.map(m => ({
        id: m.id,
        name: m.name,
        order: m.order,
        description: m.description || '',
        xp_reward: m.xp_reward,
        is_completed: m.is_completed,
        prerequisites: m.prerequisites || [],
        course_id: m.course_id,
        created_at: m.created_at,
        updated_at: m.updated_at
      }));
      return { success: true, data: modulesDto };
    } catch (error) {
      this.logger.error('Error getting course modules', { courseId }, error as Error);
      return { success: false, error: 'Failed to retrieve course modules' };
    }
  }

  async getCourseTeachers(courseId: string): Promise<ServiceResult<UserResponseDto[]>> {
     this.logger.debug('Getting teachers for course', { courseId });
    try {
      const courseExists = await this.courseRepository.findById(courseId);
      if (!courseExists) return { success: false, error: 'Course not found' };

      const teachers = await this.courseRepository.getCourseTeachers(courseId);
      const teachersDto = teachers.map(t => ({ 
        id: t.id,
        name: t.name,
        email: t.email,
        role_id: (t as any).role_id || '',
        institution_id: (t as any).institution_id,
        endereco: (t as any).endereco,
        telefone: (t as any).telefone,
        school_id: (t as any).school_id,
        is_active: (t as any).is_active ?? true,
        created_at: t.created_at,
        updated_at: t.updated_at
      }));
      return { success: true, data: teachersDto };
    } catch (error) {
      this.logger.error('Error getting course teachers', { courseId }, error as Error);
      return { success: false, error: 'Failed to retrieve course teachers' };
    }
  }
  
  async getCourseStudents(courseId: string): Promise<ServiceResult<UserResponseDto[]>> {
    this.logger.debug('Getting students for course', { courseId });
    try {
      const courseExists = await this.courseRepository.findById(courseId);
      if (!courseExists) return { success: false, error: 'Course not found' };

      const students = await this.courseRepository.getCourseStudents(courseId); // Precisa existir no repo
      const studentsDto = students.map(s => ({ 
        id: s.id,
        name: s.name,
        email: s.email,
        role_id: (s as any).role_id || '',
        institution_id: (s as any).institution_id,
        endereco: (s as any).endereco,
        telefone: (s as any).telefone,
        school_id: (s as any).school_id,
        is_active: (s as any).is_active ?? true,
        created_at: s.created_at,
        updated_at: s.updated_at
      }));
      return { success: true, data: studentsDto };
    } catch (error) {
      this.logger.error('Error getting course students', { courseId }, error as Error);
      return { success: false, error: 'Failed to retrieve course students' };
    }
  }

  async addTeacherToCourse(courseId: string, dto: AddRemoveTeacherStudentDto, actorId?: string): Promise<ServiceResult<boolean>> {
    this.logger.debug('Adding teacher to course', { courseId, userId: dto.userId, actorId });
    try {
      // Validar se curso e usuário existem, se usuário é professor, etc.
      const course = await this.courseRepository.findById(courseId);
      if (!course) return { success: false, error: 'Course not found' };
      const teacher = await this.userRepository.findById(dto.userId);
      if (!teacher) return { success: false, error: 'User not found' };
      // TODO: Verificar se o usuário é professor quando o método findUserWithRole estiver disponível

      await this.courseRepository.addTeacherToCourse(courseId, dto.userId);
      return { success: true, data: true };
    } catch (error) {
      this.logger.error('Error adding teacher to course', { courseId, userId: dto.userId }, error as Error);
      return { success: false, error: 'Failed to add teacher to course' };
    }
  }

  async removeTeacherFromCourse(courseId: string, dto: AddRemoveTeacherStudentDto, actorId?: string): Promise<ServiceResult<boolean>> {
    this.logger.debug('Removing teacher from course', { courseId, userId: dto.userId, actorId });
    try {
      const removed = await this.courseRepository.removeTeacherFromCourse(courseId, dto.userId);
      if (!removed) return { success: false, error: 'Teacher not found in course or failed to remove' };
      return { success: true, data: true };
    } catch (error) {
      this.logger.error('Error removing teacher from course', { courseId, userId: dto.userId }, error as Error);
      return { success: false, error: 'Failed to remove teacher from course' };
    }
  }
  
  async addStudentToCourse(courseId: string, dto: AddRemoveTeacherStudentDto, actorId?: string): Promise<ServiceResult<boolean>> {
    this.logger.debug('Adding student to course', { courseId, userId: dto.userId, actorId });
    try {
      // Validar se curso e usuário existem, se usuário é estudante, etc.
      const course = await this.courseRepository.findById(courseId);
      if (!course) return { success: false, error: 'Course not found' };
      const student = await this.userRepository.findById(dto.userId);
      if (!student) return { success: false, error: 'User not found' };
      // TODO: Verificar se o usuário é estudante quando o método findUserWithRole estiver disponível

      await this.courseRepository.addStudentToCourse(courseId, dto.userId);
      return { success: true, data: true };
    } catch (error) {
      this.logger.error('Error adding student to course', { courseId, userId: dto.userId }, error as Error);
      return { success: false, error: 'Failed to add student to course' };
    }
  }

  async removeStudentFromCourse(courseId: string, dto: AddRemoveTeacherStudentDto, actorId?: string): Promise<ServiceResult<boolean>> {
    this.logger.debug('Removing student from course', { courseId, userId: dto.userId, actorId });
     try {
      const removed = await this.courseRepository.removeStudentFromCourse(courseId, dto.userId);
      if (!removed) return { success: false, error: 'Student not found in course or failed to remove' };
      return { success: true, data: true };
    } catch (error) {
      this.logger.error('Error removing student from course', { courseId, userId: dto.userId }, error as Error);
      return { success: false, error: 'Failed to remove student from course' };
    }
  }
  
  async updateStudentProgress(courseId: string, userId: string, dto: UpdateStudentProgressDto, actorId?: string): Promise<ServiceResult<boolean>> {
    this.logger.debug('Updating student progress', { courseId, userId, progress: dto.progress, actorId });
    try {
      // Validar se curso, usuário e matrícula existem
      await this.courseRepository.updateStudentProgress(courseId, userId, dto.progress, dto.grades);
      return { success: true, data: true };
    } catch (error) {
      this.logger.error('Error updating student progress', { courseId, userId, progress: dto.progress }, error as Error);
      return { success: false, error: 'Failed to update student progress' };
    }
  }

  // --- Helper para paginação (pode ir para BaseService se for comum) ---
  private calculatePagination(totalItems: number, page: number, limit: number) {
    const totalPages = Math.ceil(totalItems / limit);
    return {
      total: totalItems,
      limit,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}