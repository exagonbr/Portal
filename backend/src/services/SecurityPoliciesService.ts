import { SecurityPolicies } from '../entities/SecurityPolicies';
import { SecurityPoliciesRepository } from '../repositories/SecurityPoliciesRepository';
import { CreateSecurityPoliciesDto, UpdateSecurityPoliciesDto, SecurityPoliciesResponseDto } from '../dtos/SecurityPoliciesDto';

export class SecurityPoliciesService {
  constructor(
    private SecurityPoliciesRepository: SecurityPoliciesRepository
  ) {}

  async create(createDto: CreateSecurityPoliciesDto): Promise<SecurityPoliciesResponseDto> {
    const entity = this.SecurityPoliciesRepository.create(createDto);
    const saved = await this.SecurityPoliciesRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: SecurityPoliciesResponseDto[], total: number }> {
    const { data, total } = await this.SecurityPoliciesRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<SecurityPoliciesResponseDto | null> {
    const entity = await this.SecurityPoliciesRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateSecurityPoliciesDto): Promise<SecurityPoliciesResponseDto | null> {
    await this.SecurityPoliciesRepository.update(id, updateDto);
    const updated = await this.SecurityPoliciesRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.SecurityPoliciesRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.SecurityPoliciesRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<SecurityPoliciesResponseDto[]> {
    const entities = await this.SecurityPoliciesRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: SecurityPolicies): SecurityPoliciesResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}