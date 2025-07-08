import { Answer } from '../entities/Answer';
import { AnswerRepository } from '../repositories/AnswerRepository';
import { CreateAnswerDto, UpdateAnswerDto, AnswerResponseDto } from '../dtos/AnswerDto';

export class AnswerService {
  constructor(
    private AnswerRepository: AnswerRepository
  ) {}

  async create(createDto: CreateAnswerDto): Promise<AnswerResponseDto> {
    const entity = this.AnswerRepository.create(createDto);
    const saved = await this.AnswerRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: AnswerResponseDto[], total: number }> {
    const { data, total } = await this.AnswerRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<AnswerResponseDto | null> {
    const entity = await this.AnswerRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateAnswerDto): Promise<AnswerResponseDto | null> {
    await this.AnswerRepository.update(id, updateDto);
    const updated = await this.AnswerRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.AnswerRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.AnswerRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<AnswerResponseDto[]> {
    const entities = await this.AnswerRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Answer): AnswerResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}