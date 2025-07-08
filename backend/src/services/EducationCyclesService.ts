import { EducationCycles } from '../entities/EducationCycles';
import { EducationCyclesRepository } from '../repositories/EducationCyclesRepository';
import { CreateEducationCyclesDto, UpdateEducationCyclesDto, EducationCyclesResponseDto } from '../dtos/EducationCyclesDto';

export class EducationCyclesService {
  constructor(
    private EducationCyclesRepository: EducationCyclesRepository
  ) {}

  async create(createDto: CreateEducationCyclesDto): Promise<EducationCyclesResponseDto> {
    const entity = this.EducationCyclesRepository.create(createDto);
    const saved = await this.EducationCyclesRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: EducationCyclesResponseDto[], total: number }> {
    const { data, total } = await this.EducationCyclesRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<EducationCyclesResponseDto | null> {
    const entity = await this.EducationCyclesRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateEducationCyclesDto): Promise<EducationCyclesResponseDto | null> {
    await this.EducationCyclesRepository.update(id, updateDto);
    const updated = await this.EducationCyclesRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.EducationCyclesRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.EducationCyclesRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<EducationCyclesResponseDto[]> {
    const entities = await this.EducationCyclesRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: EducationCycles): EducationCyclesResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}