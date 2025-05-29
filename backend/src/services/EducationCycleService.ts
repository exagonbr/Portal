import { 
  EducationCycleDto, 
  CreateEducationCycleDto, 
  UpdateEducationCycleDto, 
  EducationCycleFilterDto,
  PaginatedEducationCyclesDto,
  EducationCycleWithClassesDto,
  CreateClassEducationCycleDto
} from '../dto/EducationCycleDto';
import { EducationCycleRepository } from '../repositories/EducationCycleRepository';
import { ClassRepository } from '../repositories/ClassRepository';
import { AppError } from '../utils/AppError';

export class EducationCycleService {
  private educationCycleRepository: EducationCycleRepository;
  private classRepository: ClassRepository;

  constructor() {
    this.educationCycleRepository = new EducationCycleRepository();
    this.classRepository = new ClassRepository();
  }

  async create(data: CreateEducationCycleDto): Promise<EducationCycleDto> {
    // Validar faixa etária se fornecida
    if (data.min_age !== undefined && data.max_age !== undefined) {
      if (data.min_age > data.max_age) {
        throw new AppError('A idade mínima não pode ser maior que a idade máxima', 400);
      }
    }

    // Validar duração
    if (data.duration_years <= 0) {
      throw new AppError('A duração deve ser maior que zero', 400);
    }

    const cycle = await this.educationCycleRepository.create(data);
    return this.toDto(cycle);
  }

  async update(id: string, data: UpdateEducationCycleDto): Promise<EducationCycleDto> {
    // Verificar se o ciclo existe
    const existingCycle = await this.educationCycleRepository.findById(id);
    if (!existingCycle) {
      throw new AppError('Ciclo de ensino não encontrado', 404);
    }

    // Validar faixa etária se fornecida
    const minAge = data.min_age ?? existingCycle.min_age;
    const maxAge = data.max_age ?? existingCycle.max_age;
    
    if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
      throw new AppError('A idade mínima não pode ser maior que a idade máxima', 400);
    }

    // Validar duração
    if (data.duration_years !== undefined && data.duration_years <= 0) {
      throw new AppError('A duração deve ser maior que zero', 400);
    }

    const updatedCycle = await this.educationCycleRepository.update(id, data);
    if (!updatedCycle) {
      throw new AppError('Erro ao atualizar ciclo de ensino', 500);
    }

    return this.toDto(updatedCycle);
  }

  async findById(id: string): Promise<EducationCycleDto> {
    const cycle = await this.educationCycleRepository.findById(id);
    if (!cycle) {
      throw new AppError('Ciclo de ensino não encontrado', 404);
    }

    return this.toDto(cycle);
  }

  async findByLevel(level: string): Promise<EducationCycleDto[]> {
    const cycles = await this.educationCycleRepository.findByLevel(level);
    return cycles.map(cycle => this.toDto(cycle));
  }

  async findWithPagination(filter: EducationCycleFilterDto): Promise<PaginatedEducationCyclesDto> {
    const result = await this.educationCycleRepository.findWithPagination(filter);
    
    return {
      education_cycles: result.education_cycles.map(cycle => this.toDto(cycle)),
      pagination: result.pagination
    };
  }

  async getWithClasses(cycleId: string): Promise<EducationCycleWithClassesDto> {
    const cycleWithClasses = await this.educationCycleRepository.getWithClasses(cycleId);
    if (!cycleWithClasses) {
      throw new AppError('Ciclo de ensino não encontrado', 404);
    }

    return cycleWithClasses;
  }

  async associateClass(data: CreateClassEducationCycleDto): Promise<void> {
    // Verificar se o ciclo existe
    const cycle = await this.educationCycleRepository.findById(data.education_cycle_id);
    if (!cycle) {
      throw new AppError('Ciclo de ensino não encontrado', 404);
    }

    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(data.class_id);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    // Verificar se a associação já existe
    const associationExists = await this.educationCycleRepository.checkAssociationExists(
      data.class_id,
      data.education_cycle_id
    );
    if (associationExists) {
      throw new AppError('Esta turma já está associada a este ciclo de ensino', 400);
    }

    await this.educationCycleRepository.associateClass(data);
  }

  async disassociateClass(classId: string, cycleId: string): Promise<void> {
    // Verificar se a associação existe
    const associationExists = await this.educationCycleRepository.checkAssociationExists(
      classId,
      cycleId
    );
    if (!associationExists) {
      throw new AppError('Esta turma não está associada a este ciclo de ensino', 404);
    }

    const success = await this.educationCycleRepository.disassociateClass(classId, cycleId);
    if (!success) {
      throw new AppError('Erro ao desassociar turma do ciclo de ensino', 500);
    }
  }

  async getClassCycles(classId: string): Promise<EducationCycleDto[]> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    const cycles = await this.educationCycleRepository.getClassCycles(classId);
    return cycles.map(cycle => this.toDto(cycle));
  }

  async delete(id: string): Promise<void> {
    const cycle = await this.educationCycleRepository.findById(id);
    if (!cycle) {
      throw new AppError('Ciclo de ensino não encontrado', 404);
    }

    // Verificar se há turmas associadas
    const cycleWithClasses = await this.educationCycleRepository.getWithClasses(id);
    if (cycleWithClasses && cycleWithClasses.classes.length > 0) {
      throw new AppError('Não é possível excluir um ciclo de ensino com turmas associadas', 400);
    }

    const success = await this.educationCycleRepository.delete(id);
    if (!success) {
      throw new AppError('Erro ao excluir ciclo de ensino', 500);
    }
  }

  private toDto(cycle: any): EducationCycleDto {
    return {
      id: cycle.id,
      name: cycle.name,
      level: cycle.level,
      description: cycle.description,
      duration_years: cycle.duration_years,
      min_age: cycle.min_age,
      max_age: cycle.max_age,
      created_at: cycle.created_at,
      updated_at: cycle.updated_at
    };
  }
}