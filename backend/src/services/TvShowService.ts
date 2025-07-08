import { TvShow } from '../entities/TvShow';
import { TvShowRepository } from '../repositories/TvShowRepository';
import { CreateTvShowDto, UpdateTvShowDto, TvShowResponseDto } from '../dtos/TvShowDto';

export class TvShowService {
  constructor(
    private TvShowRepository: TvShowRepository
  ) {}

  async create(createDto: CreateTvShowDto): Promise<TvShowResponseDto> {
    const entity = this.TvShowRepository.create(createDto);
    const saved = await this.TvShowRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: TvShowResponseDto[], total: number }> {
    const { data, total } = await this.TvShowRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<TvShowResponseDto | null> {
    const entity = await this.TvShowRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateTvShowDto): Promise<TvShowResponseDto | null> {
    await this.TvShowRepository.update(id, updateDto);
    const updated = await this.TvShowRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.TvShowRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.TvShowRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<TvShowResponseDto[]> {
    const entities = await this.TvShowRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: TvShow): TvShowResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}