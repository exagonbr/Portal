import { Classes } from '../entities/Classes';
import { ClassesRepository } from '../repositories/ClassesRepository';
import { CreateClassesDto, UpdateClassesDto, ClassesResponseDto } from '../dtos/ClassesDto';

export class ClassesService {
  constructor(
    private ClassesRepository: ClassesRepository
  ) {}

  async create(createDto: CreateClassesDto): Promise<ClassesResponseDto> {
    const entity = this.ClassesRepository.create(createDto);
    const saved = await this.ClassesRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ClassesResponseDto[], total: number }> {
    const { data, total } = await this.ClassesRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<ClassesResponseDto | null> {
    const entity = await this.ClassesRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateClassesDto): Promise<ClassesResponseDto | null> {
    await this.ClassesRepository.update(id, updateDto);
    const updated = await this.ClassesRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.ClassesRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.ClassesRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<ClassesResponseDto[]> {
    const entities = await this.ClassesRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Classes): ClassesResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}