import { Unit } from '../entities/Unit';
import { UnitRepository } from '../repositories/UnitRepository';
import { CreateUnitDto, UpdateUnitDto, UnitResponseDto } from '../dtos/UnitDto';

export class UnitService {
  constructor(
    private UnitRepository: UnitRepository
  ) {}

  async create(createDto: CreateUnitDto): Promise<UnitResponseDto> {
    const entity = this.UnitRepository.create(createDto);
    const saved = await this.UnitRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: UnitResponseDto[], total: number }> {
    const { data, total } = await this.UnitRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<UnitResponseDto | null> {
    const entity = await this.UnitRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateUnitDto): Promise<UnitResponseDto | null> {
    await this.UnitRepository.update(id, updateDto);
    const updated = await this.UnitRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.UnitRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.UnitRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<UnitResponseDto[]> {
    const entities = await this.UnitRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Unit): UnitResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}