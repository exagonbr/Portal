import { Certificate } from '../entities/Certificate';
import { CertificateRepository } from '../repositories/CertificateRepository';
import { CreateCertificateDto, UpdateCertificateDto, CertificateResponseDto } from '../dtos/CertificateDto';

export class CertificateService {
  constructor(
    private CertificateRepository: CertificateRepository
  ) {}

  async create(createDto: CreateCertificateDto): Promise<CertificateResponseDto> {
    const entity = this.CertificateRepository.create(createDto);
    const saved = await this.CertificateRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: CertificateResponseDto[], total: number }> {
    const { data, total } = await this.CertificateRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<CertificateResponseDto | null> {
    const entity = await this.CertificateRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateCertificateDto): Promise<CertificateResponseDto | null> {
    await this.CertificateRepository.update(id, updateDto);
    const updated = await this.CertificateRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.CertificateRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.CertificateRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<CertificateResponseDto[]> {
    const entities = await this.CertificateRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Certificate): CertificateResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}