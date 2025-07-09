import { EducationalStage } from '../entities/EducationalStage';
import { EducationalStageRepository } from '../repositories/EducationalStageRepository';
import { CreateEducationalStageDto, UpdateEducationalStageDto, EducationalStageResponseDto } from '../dtos/EducationalStageDto';

export class EducationalStageService {
  constructor(
    private EducationalStageRepository: EducationalStageRepository
  ) {}

  async create(createDto: CreateEducationalStageDto): Promise<EducationalStageResponseDto> {
    const entity = this.EducationalStageRepository.create(createDto);
    const saved = await this.EducationalStageRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: EducationalStageResponseDto[], total: number }> {
    const { data, total } = await this.EducationalStageRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<EducationalStageResponseDto | null> {
    const entity = await this.EducationalStageRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateEducationalStageDto): Promise<EducationalStageResponseDto | null> {
    await this.EducationalStageRepository.update(id, updateDto);
    const updated = await this.EducationalStageRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.EducationalStageRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.EducationalStageRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<EducationalStageResponseDto[]> {
    const entities = await this.EducationalStageRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: EducationalStage): EducationalStageResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}