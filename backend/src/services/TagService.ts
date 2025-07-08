import { Tag } from '../entities/Tag';
import { TagRepository } from '../repositories/TagRepository';
import { CreateTagDto, UpdateTagDto, TagResponseDto } from '../dtos/TagDto';

export class TagService {
  constructor(
    private TagRepository: TagRepository
  ) {}

  async create(createDto: CreateTagDto): Promise<TagResponseDto> {
    const entity = this.TagRepository.create(createDto);
    const saved = await this.TagRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: TagResponseDto[], total: number }> {
    const { data, total } = await this.TagRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<TagResponseDto | null> {
    const entity = await this.TagRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateTagDto): Promise<TagResponseDto | null> {
    await this.TagRepository.update(id, updateDto);
    const updated = await this.TagRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.TagRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.TagRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<TagResponseDto[]> {
    const entities = await this.TagRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Tag): TagResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}