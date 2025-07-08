import { Genre } from '../entities/Genre';
import { GenreRepository } from '../repositories/GenreRepository';
import { CreateGenreDto, UpdateGenreDto, GenreResponseDto } from '../dtos/GenreDto';

export class GenreService {
  constructor(
    private GenreRepository: GenreRepository
  ) {}

  async create(createDto: CreateGenreDto): Promise<GenreResponseDto> {
    const entity = this.GenreRepository.create(createDto);
    const saved = await this.GenreRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: GenreResponseDto[], total: number }> {
    const { data, total } = await this.GenreRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<GenreResponseDto | null> {
    const entity = await this.GenreRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateGenreDto): Promise<GenreResponseDto | null> {
    await this.GenreRepository.update(id, updateDto);
    const updated = await this.GenreRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.GenreRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.GenreRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<GenreResponseDto[]> {
    const entities = await this.GenreRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Genre): GenreResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}