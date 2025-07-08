import { File } from '../entities/File';
import { FileRepository } from '../repositories/FileRepository';
import { CreateFileDto, UpdateFileDto, FileResponseDto } from '../dtos/FileDto';

export class FileService {
  constructor(
    private FileRepository: FileRepository
  ) {}

  async create(createDto: CreateFileDto): Promise<FileResponseDto> {
    const entity = this.FileRepository.create(createDto);
    const saved = await this.FileRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: FileResponseDto[], total: number }> {
    const { data, total } = await this.FileRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<FileResponseDto | null> {
    const entity = await this.FileRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateFileDto): Promise<FileResponseDto | null> {
    await this.FileRepository.update(id, updateDto);
    const updated = await this.FileRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.FileRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.FileRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<FileResponseDto[]> {
    const entities = await this.FileRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: File): FileResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}