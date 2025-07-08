import { Video } from '../entities/Video';
import { VideoRepository } from '../repositories/VideoRepository';
import { CreateVideoDto, UpdateVideoDto, VideoResponseDto } from '../dtos/VideoDto';

export class VideoService {
  constructor(
    private VideoRepository: VideoRepository
  ) {}

  async create(createDto: CreateVideoDto): Promise<VideoResponseDto> {
    const entity = this.VideoRepository.create(createDto);
    const saved = await this.VideoRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: VideoResponseDto[], total: number }> {
    const { data, total } = await this.VideoRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<VideoResponseDto | null> {
    const entity = await this.VideoRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateVideoDto): Promise<VideoResponseDto | null> {
    await this.VideoRepository.update(id, updateDto);
    const updated = await this.VideoRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.VideoRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.VideoRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<VideoResponseDto[]> {
    const entities = await this.VideoRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Video): VideoResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}