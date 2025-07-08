import { Theme } from '../entities/Theme';
import { ThemeRepository } from '../repositories/ThemeRepository';
import { CreateThemeDto, UpdateThemeDto, ThemeResponseDto } from '../dtos/ThemeDto';

export class ThemeService {
  constructor(
    private ThemeRepository: ThemeRepository
  ) {}

  async create(createDto: CreateThemeDto): Promise<ThemeResponseDto> {
    const entity = this.ThemeRepository.create(createDto);
    const saved = await this.ThemeRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ThemeResponseDto[], total: number }> {
    const { data, total } = await this.ThemeRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<ThemeResponseDto | null> {
    const entity = await this.ThemeRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateThemeDto): Promise<ThemeResponseDto | null> {
    await this.ThemeRepository.update(id, updateDto);
    const updated = await this.ThemeRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.ThemeRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.ThemeRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<ThemeResponseDto[]> {
    const entities = await this.ThemeRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Theme): ThemeResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}