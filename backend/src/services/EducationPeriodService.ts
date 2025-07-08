import { EducationPeriod } from '../entities/EducationPeriod';
import { EducationPeriodRepository } from '../repositories/EducationPeriodRepository';
import { CreateEducationPeriodDto, UpdateEducationPeriodDto, EducationPeriodResponseDto } from '../dtos/EducationPeriodDto';

export class EducationPeriodService {
  constructor(
    private EducationPeriodRepository: EducationPeriodRepository
  ) {}

  async create(createDto: CreateEducationPeriodDto): Promise<EducationPeriodResponseDto> {
    const entity = this.EducationPeriodRepository.create(createDto);
    const saved = await this.EducationPeriodRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: EducationPeriodResponseDto[], total: number }> {
    const { data, total } = await this.EducationPeriodRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<EducationPeriodResponseDto | null> {
    const entity = await this.EducationPeriodRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateEducationPeriodDto): Promise<EducationPeriodResponseDto | null> {
    await this.EducationPeriodRepository.update(id, updateDto);
    const updated = await this.EducationPeriodRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.EducationPeriodRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.EducationPeriodRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<EducationPeriodResponseDto[]> {
    const entities = await this.EducationPeriodRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: EducationPeriod): EducationPeriodResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}