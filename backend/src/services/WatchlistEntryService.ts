import { WatchlistEntry } from '../entities/WatchlistEntry';
import { WatchlistEntryRepository } from '../repositories/WatchlistEntryRepository';
import { CreateWatchlistEntryDto, UpdateWatchlistEntryDto, WatchlistEntryResponseDto } from '../dtos/WatchlistEntryDto';

export class WatchlistEntryService {
  constructor(
    private WatchlistEntryRepository: WatchlistEntryRepository
  ) {}

  async create(createDto: CreateWatchlistEntryDto): Promise<WatchlistEntryResponseDto> {
    const entity = this.WatchlistEntryRepository.create(createDto);
    const saved = await this.WatchlistEntryRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: WatchlistEntryResponseDto[], total: number }> {
    const { data, total } = await this.WatchlistEntryRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<WatchlistEntryResponseDto | null> {
    const entity = await this.WatchlistEntryRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateWatchlistEntryDto): Promise<WatchlistEntryResponseDto | null> {
    await this.WatchlistEntryRepository.update(id, updateDto);
    const updated = await this.WatchlistEntryRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.WatchlistEntryRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.WatchlistEntryRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<WatchlistEntryResponseDto[]> {
    const entities = await this.WatchlistEntryRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: WatchlistEntry): WatchlistEntryResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}