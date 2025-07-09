import { ActivitySummaries } from '../entities/ActivitySummaries';
import { ActivitySummariesRepository } from '../repositories/ActivitySummariesRepository';
import { CreateActivitySummariesDto, UpdateActivitySummariesDto, ActivitySummariesResponseDto } from '../dtos/ActivitySummariesDto';

export class ActivitySummariesService {
  constructor(
    private ActivitySummariesRepository: ActivitySummariesRepository
  ) {}

  async create(createDto: CreateActivitySummariesDto): Promise<ActivitySummariesResponseDto> {
    const entity = this.ActivitySummariesRepository.create(createDto);
    const saved = await this.ActivitySummariesRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ActivitySummariesResponseDto[], total: number }> {
    const { data, total } = await this.ActivitySummariesRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<ActivitySummariesResponseDto | null> {
    const entity = await this.ActivitySummariesRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateActivitySummariesDto): Promise<ActivitySummariesResponseDto | null> {
    await this.ActivitySummariesRepository.update(id, updateDto);
    const updated = await this.ActivitySummariesRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.ActivitySummariesRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.ActivitySummariesRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<ActivitySummariesResponseDto[]> {
    const entities = await this.ActivitySummariesRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: ActivitySummaries): ActivitySummariesResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}