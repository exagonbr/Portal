import { RolePermissions } from '../entities/RolePermissions';
import { RolePermissionsRepository } from '../repositories/RolePermissionsRepository';
import { CreateRolePermissionsDto, UpdateRolePermissionsDto, RolePermissionsResponseDto } from '../dtos/RolePermissionsDto';

export class RolePermissionsService {
  constructor(
    private RolePermissionsRepository: RolePermissionsRepository
  ) {}

  async create(createDto: CreateRolePermissionsDto): Promise<RolePermissionsResponseDto> {
    const entity = this.RolePermissionsRepository.create(createDto);
    const saved = await this.RolePermissionsRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: RolePermissionsResponseDto[], total: number }> {
    const { data, total } = await this.RolePermissionsRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<RolePermissionsResponseDto | null> {
    const entity = await this.RolePermissionsRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateRolePermissionsDto): Promise<RolePermissionsResponseDto | null> {
    await this.RolePermissionsRepository.update(id, updateDto);
    const updated = await this.RolePermissionsRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.RolePermissionsRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.RolePermissionsRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<RolePermissionsResponseDto[]> {
    const entities = await this.RolePermissionsRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: RolePermissions): RolePermissionsResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}