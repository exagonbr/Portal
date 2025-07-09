import { Institutions } from '../entities/Institutions';
import { InstitutionsRepository } from '../repositories/InstitutionsRepository';
import { CreateInstitutionsDto, UpdateInstitutionsDto, InstitutionsResponseDto } from '../dtos/InstitutionsDto';

export class InstitutionsService {
  constructor(
    private InstitutionsRepository: InstitutionsRepository
  ) {}

  async create(createDto: CreateInstitutionsDto): Promise<InstitutionsResponseDto> {
    const entity = this.InstitutionsRepository.create(createDto);
    const saved = await this.InstitutionsRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: InstitutionsResponseDto[], total: number }> {
    const { data, total } = await this.InstitutionsRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<InstitutionsResponseDto | null> {
    const entity = await this.InstitutionsRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateInstitutionsDto): Promise<InstitutionsResponseDto | null> {
    await this.InstitutionsRepository.update(id, updateDto);
    const updated = await this.InstitutionsRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.InstitutionsRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.InstitutionsRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<InstitutionsResponseDto[]> {
    const entities = await this.InstitutionsRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Institutions): InstitutionsResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}