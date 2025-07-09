import { TeacherSubject } from '../entities/TeacherSubject';
import { TeacherSubjectRepository } from '../repositories/TeacherSubjectRepository';
import { CreateTeacherSubjectDto, UpdateTeacherSubjectDto, TeacherSubjectResponseDto } from '../dtos/TeacherSubjectDto';

export class TeacherSubjectService {
  constructor(
    private TeacherSubjectRepository: TeacherSubjectRepository
  ) {}

  async create(createDto: CreateTeacherSubjectDto): Promise<TeacherSubjectResponseDto> {
    const entity = this.TeacherSubjectRepository.create(createDto);
    const saved = await this.TeacherSubjectRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: TeacherSubjectResponseDto[], total: number }> {
    const { data, total } = await this.TeacherSubjectRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<TeacherSubjectResponseDto | null> {
    const entity = await this.TeacherSubjectRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateTeacherSubjectDto): Promise<TeacherSubjectResponseDto | null> {
    await this.TeacherSubjectRepository.update(id, updateDto);
    const updated = await this.TeacherSubjectRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.TeacherSubjectRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.TeacherSubjectRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<TeacherSubjectResponseDto[]> {
    const entities = await this.TeacherSubjectRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: TeacherSubject): TeacherSubjectResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}