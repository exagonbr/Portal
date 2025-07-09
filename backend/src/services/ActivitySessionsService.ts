import { ActivitySessions } from '../entities/ActivitySessions';
import { ActivitySessionsRepository } from '../repositories/ActivitySessionsRepository';
import { CreateActivitySessionsDto, UpdateActivitySessionsDto, ActivitySessionsResponseDto } from '../dtos/ActivitySessionsDto';

export class ActivitySessionsService {
  constructor(
    private ActivitySessionsRepository: ActivitySessionsRepository
  ) {}

  async create(createDto: CreateActivitySessionsDto): Promise<ActivitySessionsResponseDto> {
    const entity = this.ActivitySessionsRepository.create(createDto);
    const saved = await this.ActivitySessionsRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ActivitySessionsResponseDto[], total: number }> {
    const { data, total } = await this.ActivitySessionsRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<ActivitySessionsResponseDto | null> {
    const entity = await this.ActivitySessionsRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateActivitySessionsDto): Promise<ActivitySessionsResponseDto | null> {
    await this.ActivitySessionsRepository.update(id, updateDto);
    const updated = await this.ActivitySessionsRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.ActivitySessionsRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.ActivitySessionsRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<ActivitySessionsResponseDto[]> {
    const entities = await this.ActivitySessionsRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: ActivitySessions): ActivitySessionsResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}