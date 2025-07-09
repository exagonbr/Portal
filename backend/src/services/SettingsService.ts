import { Settings } from '../entities/Settings';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { CreateSettingsDto, UpdateSettingsDto, SettingsResponseDto } from '../dtos/SettingsDto';

export class SettingsService {
  constructor(
    private SettingsRepository: SettingsRepository
  ) {}

  async create(createDto: CreateSettingsDto): Promise<SettingsResponseDto> {
    const entity = this.SettingsRepository.create(createDto);
    const saved = await this.SettingsRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: SettingsResponseDto[], total: number }> {
    const { data, total } = await this.SettingsRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<SettingsResponseDto | null> {
    const entity = await this.SettingsRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateSettingsDto): Promise<SettingsResponseDto | null> {
    await this.SettingsRepository.update(id, updateDto);
    const updated = await this.SettingsRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.SettingsRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.SettingsRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<SettingsResponseDto[]> {
    const entities = await this.SettingsRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Settings): SettingsResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}