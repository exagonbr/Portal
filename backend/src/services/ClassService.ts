import { 
  ClassDto, 
  CreateClassDto, 
  UpdateClassDto, 
  ClassFilterDto,
  PaginatedClassesDto,
  ClassStatsDto,
  ClassWithDetailsDto
} from '../dto/ClassDto';
import { ClassRepository } from '../repositories/ClassRepository';
import { SchoolRepository } from '../repositories/SchoolRepository';
import { AppError } from '../utils/AppError';

export class ClassService {
  private classRepository: ClassRepository;
  private schoolRepository: SchoolRepository;

  constructor() {
    this.classRepository = new ClassRepository();
    this.schoolRepository = new SchoolRepository();
  }

  async create(data: CreateClassDto): Promise<ClassDto> {
    // Verificar se a escola existe
    const school = await this.schoolRepository.findById(data.school_id);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    // Verificar se já existe uma turma com o mesmo código na escola e ano
    const existingClass = await this.classRepository.findByCodeAndSchool(
      data.code,
      data.school_id,
      data.year
    );
    if (existingClass) {
      throw new AppError('Já existe uma turma com este código nesta escola e ano', 400);
    }

    const classEntity = await this.classRepository.create(data);
    return this.toDto(classEntity);
  }

  async update(id: string, data: UpdateClassDto): Promise<ClassDto> {
    // Verificar se a turma existe
    const existingClass = await this.classRepository.findById(id);
    if (!existingClass) {
      throw new AppError('Turma não encontrada', 404);
    }

    // Se estiver atualizando a escola, verificar se ela existe
    if (data.school_id && data.school_id !== existingClass.school_id) {
      const school = await this.schoolRepository.findById(data.school_id);
      if (!school) {
        throw new AppError('Escola não encontrada', 404);
      }
    }

    // Se estiver atualizando código, escola ou ano, verificar unicidade
    if (
      (data.code && data.code !== existingClass.code) ||
      (data.school_id && data.school_id !== existingClass.school_id) ||
      (data.year && data.year !== existingClass.year)
    ) {
      const code = data.code || existingClass.code;
      const schoolId = data.school_id || existingClass.school_id;
      const year = data.year || existingClass.year;

      const isUnique = await this.classRepository.checkCodeUniqueness(
        code,
        schoolId,
        year,
        id
      );
      if (!isUnique) {
        throw new AppError('Já existe uma turma com este código nesta escola e ano', 400);
      }
    }

    const updatedClass = await this.classRepository.update(id, data);
    if (!updatedClass) {
      throw new AppError('Erro ao atualizar turma', 500);
    }

    return this.toDto(updatedClass);
  }

  async findById(id: string): Promise<ClassDto> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    return this.toDto(classEntity);
  }

  async findBySchool(schoolId: string): Promise<ClassDto[]> {
    // Verificar se a escola existe
    const school = await this.schoolRepository.findById(schoolId);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    const classes = await this.classRepository.findBySchool(schoolId);
    return classes.map(c => this.toDto(c));
  }

  async findWithPagination(filter: ClassFilterDto): Promise<PaginatedClassesDto> {
    const result = await this.classRepository.findWithPagination(filter);
    
    return {
      classes: result.classes.map(c => this.toDto(c)),
      pagination: result.pagination
    };
  }

  async getStats(classId: string): Promise<ClassStatsDto> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    return await this.classRepository.getStats(classId);
  }

  async getWithDetails(classId: string): Promise<ClassWithDetailsDto> {
    const classDetails = await this.classRepository.getWithDetails(classId);
    if (!classDetails) {
      throw new AppError('Turma não encontrada', 404);
    }

    return classDetails;
  }

  async delete(id: string): Promise<void> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    // Em vez de deletar, desativar a turma
    await this.classRepository.update(id, { is_active: false });
  }

  async activate(id: string): Promise<ClassDto> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    const updatedClass = await this.classRepository.update(id, { is_active: true });
    if (!updatedClass) {
      throw new AppError('Erro ao ativar turma', 500);
    }

    return this.toDto(updatedClass);
  }

  private toDto(classEntity: any): ClassDto {
    return {
      id: classEntity.id,
      name: classEntity.name,
      code: classEntity.code,
      school_id: classEntity.school_id,
      year: classEntity.year,
      shift: classEntity.shift,
      max_students: classEntity.max_students,
      is_active: classEntity.is_active,
      created_at: classEntity.created_at,
      updated_at: classEntity.updated_at
    };
  }
}