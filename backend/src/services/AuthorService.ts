import { Author } from '../entities/Author';
import { AuthorRepository } from '../repositories/AuthorRepository';
import { CreateAuthorDto, UpdateAuthorDto, AuthorResponseDto } from '../dtos/AuthorDto';

export class AuthorService {
  constructor(
    private AuthorRepository: AuthorRepository
  ) {}

  async create(createDto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const entity = this.AuthorRepository.create(createDto);
    const saved = await this.AuthorRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: AuthorResponseDto[], total: number }> {
    const { data, total } = await this.AuthorRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<AuthorResponseDto | null> {
    const entity = await this.AuthorRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateAuthorDto): Promise<AuthorResponseDto | null> {
    await this.AuthorRepository.update(id, updateDto);
    const updated = await this.AuthorRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.AuthorRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.AuthorRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<AuthorResponseDto[]> {
    const entities = await this.AuthorRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Author): AuthorResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}