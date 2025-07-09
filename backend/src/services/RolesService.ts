import { Roles } from '../entities/Roles';
import { RolesRepository } from '../repositories/RolesRepository';
import { CreateRolesDto, UpdateRolesDto, RolesResponseDto } from '../dtos/RolesDto';

export class RolesService {
  constructor(
    private RolesRepository: RolesRepository
  ) {}

  async create(createDto: CreateRolesDto): Promise<RolesResponseDto> {
    const entity = this.RolesRepository.create(createDto);
    const saved = await this.RolesRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: RolesResponseDto[], total: number }> {
    const { data, total } = await this.RolesRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<RolesResponseDto | null> {
    const entity = await this.RolesRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateRolesDto): Promise<RolesResponseDto | null> {
    await this.RolesRepository.update(id, updateDto);
    const updated = await this.RolesRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.RolesRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.RolesRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<RolesResponseDto[]> {
    const entities = await this.RolesRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Roles): RolesResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}