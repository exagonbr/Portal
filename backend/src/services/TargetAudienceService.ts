import { TargetAudience } from '../entities/TargetAudience';
import { TargetAudienceRepository } from '../repositories/TargetAudienceRepository';
import { CreateTargetAudienceDto, UpdateTargetAudienceDto, TargetAudienceResponseDto } from '../dtos/TargetAudienceDto';

export class TargetAudienceService {
  constructor(
    private TargetAudienceRepository: TargetAudienceRepository
  ) {}

  async create(createDto: CreateTargetAudienceDto): Promise<TargetAudienceResponseDto> {
    const entity = this.TargetAudienceRepository.create(createDto);
    const saved = await this.TargetAudienceRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: TargetAudienceResponseDto[], total: number }> {
    const { data, total } = await this.TargetAudienceRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<TargetAudienceResponseDto | null> {
    const entity = await this.TargetAudienceRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateTargetAudienceDto): Promise<TargetAudienceResponseDto | null> {
    await this.TargetAudienceRepository.update(id, updateDto);
    const updated = await this.TargetAudienceRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.TargetAudienceRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.TargetAudienceRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<TargetAudienceResponseDto[]> {
    const entities = await this.TargetAudienceRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: TargetAudience): TargetAudienceResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}