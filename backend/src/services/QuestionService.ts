import { Question } from '../entities/Question';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { CreateQuestionDto, UpdateQuestionDto, QuestionResponseDto } from '../dtos/QuestionDto';

export class QuestionService {
  constructor(
    private QuestionRepository: QuestionRepository
  ) {}

  async create(createDto: CreateQuestionDto): Promise<QuestionResponseDto> {
    const entity = this.QuestionRepository.create(createDto);
    const saved = await this.QuestionRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: QuestionResponseDto[], total: number }> {
    const { data, total } = await this.QuestionRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<QuestionResponseDto | null> {
    const entity = await this.QuestionRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateQuestionDto): Promise<QuestionResponseDto | null> {
    await this.QuestionRepository.update(id, updateDto);
    const updated = await this.QuestionRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.QuestionRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.QuestionRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<QuestionResponseDto[]> {
    const entities = await this.QuestionRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Question): QuestionResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}