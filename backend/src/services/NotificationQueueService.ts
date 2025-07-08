import { NotificationQueue } from '../entities/NotificationQueue';
import { NotificationQueueRepository } from '../repositories/NotificationQueueRepository';
import { CreateNotificationQueueDto, UpdateNotificationQueueDto, NotificationQueueResponseDto } from '../dtos/NotificationQueueDto';

export class NotificationQueueService {
  constructor(
    private NotificationQueueRepository: NotificationQueueRepository
  ) {}

  async create(createDto: CreateNotificationQueueDto): Promise<NotificationQueueResponseDto> {
    const entity = this.NotificationQueueRepository.create(createDto);
    const saved = await this.NotificationQueueRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: NotificationQueueResponseDto[], total: number }> {
    const { data, total } = await this.NotificationQueueRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<NotificationQueueResponseDto | null> {
    const entity = await this.NotificationQueueRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateNotificationQueueDto): Promise<NotificationQueueResponseDto | null> {
    await this.NotificationQueueRepository.update(id, updateDto);
    const updated = await this.NotificationQueueRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.NotificationQueueRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.NotificationQueueRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<NotificationQueueResponseDto[]> {
    const entities = await this.NotificationQueueRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: NotificationQueue): NotificationQueueResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}