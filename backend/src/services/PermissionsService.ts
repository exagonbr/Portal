import { Permissions } from '../entities/Permissions';
import { PermissionsRepository } from '../repositories/PermissionsRepository';
import { CreatePermissionsDto, UpdatePermissionsDto, PermissionsResponseDto } from '../dtos/PermissionsDto';

export class PermissionsService {
  constructor(
    private PermissionsRepository: PermissionsRepository
  ) {}

  async create(createDto: CreatePermissionsDto): Promise<PermissionsResponseDto> {
    const entity = this.PermissionsRepository.create(createDto);
    const saved = await this.PermissionsRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: PermissionsResponseDto[], total: number }> {
    const { data, total } = await this.PermissionsRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<PermissionsResponseDto | null> {
    const entity = await this.PermissionsRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdatePermissionsDto): Promise<PermissionsResponseDto | null> {
    await this.PermissionsRepository.update(id, updateDto);
    const updated = await this.PermissionsRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.PermissionsRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.PermissionsRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<PermissionsResponseDto[]> {
    const entities = await this.PermissionsRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Permissions): PermissionsResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}