import { Report } from '../entities/Report';
import { ReportRepository } from '../repositories/ReportRepository';
import { CreateReportDto, UpdateReportDto, ReportResponseDto } from '../dtos/ReportDto';

export class ReportService {
  constructor(
    private ReportRepository: ReportRepository
  ) {}

  async create(createDto: CreateReportDto): Promise<ReportResponseDto> {
    const entity = this.ReportRepository.create(createDto);
    const saved = await this.ReportRepository.save(entity);
    return this.mapToResponseDto(saved);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: ReportResponseDto[], total: number }> {
    const { data, total } = await this.ReportRepository.findWithPagination(page, limit);
    return {
      data: data.map(item => this.mapToResponseDto(item)),
      total
    };
  }

  async findOne(id: number): Promise<ReportResponseDto | null> {
    const entity = await this.ReportRepository.findByIdActive(id);
    return entity ? this.mapToResponseDto(entity) : null;
  }

  async update(id: number, updateDto: UpdateReportDto): Promise<ReportResponseDto | null> {
    await this.ReportRepository.update(id, updateDto);
    const updated = await this.ReportRepository.findByIdActive(id);
    return updated ? this.mapToResponseDto(updated) : null;
  }

  async remove(id: number): Promise<boolean> {
    const entity = await this.ReportRepository.findByIdActive(id);
    if (!entity) return false;
    
    await this.ReportRepository.softDelete(id);
    return true;
  }

  async search(name: string): Promise<ReportResponseDto[]> {
    const entities = await this.ReportRepository.searchByName(name);
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  private mapToResponseDto(entity: Report): ReportResponseDto {
    return {
      // Mapear propriedades da entidade para o DTO de resposta
      ...entity
    };
  }
}