import { Institution } from '../models/Institution';
import { InstitutionRepository } from '../repositories/InstitutionRepository';
import { BaseService } from '../common/BaseService';
import { 
  CreateInstitutionDto, 
  UpdateInstitutionDto, 
  InstitutionDto,
  InstitutionFilterDto,
  PaginatedInstitutionDto,
  InstitutionStatsDto
} from '../dto/InstitutionDto';
import { ServiceResult, PaginationResult } from '../types/common'; // Adicionado PaginationResult aqui
import { CacheService } from './CacheService';
// import { NotFoundError, ConflictError, ValidationError } from '../utils/errors'; // Comentado por enquanto

export class InstitutionService extends BaseService<Institution, CreateInstitutionDto, UpdateInstitutionDto> {
  private institutionRepository: InstitutionRepository;

  constructor() {
    const institutionRepository = new InstitutionRepository();
    super(institutionRepository, 'Institution');
    this.institutionRepository = institutionRepository;
  }

  async findInstitutionsWithFilters(filters: InstitutionFilterDto): Promise<ServiceResult<PaginatedInstitutionDto>> {
    this.logger.debug('Finding institutions with filters', { filters });
    try {
      const { sortBy, sortOrder, search, type, is_active } = filters;
      const page = filters.page || 1; // Valor padrão para page
      const limit = filters.limit || 10; // Valor padrão para limit
      
      // Criar uma chave de cache baseada nos filtros
      const cacheKey = `institutions:${search || ''}:${type || ''}:${is_active !== undefined ? is_active : ''}:${page}:${limit}:${sortBy || ''}:${sortOrder || ''}`;
      
      // Usar o serviço de cache
      const cacheService = CacheService.getInstance();
      
      // Tentar obter do cache ou executar a consulta
      return await cacheService.getOrSet<ServiceResult<PaginatedInstitutionDto>>(
        cacheKey,
        async () => {
          const queryFilters: any = {};
          if (search) {
            queryFilters.search = search;
          }
          if (type) queryFilters.type = type;
          if (is_active !== undefined) queryFilters.is_active = is_active;

          // Validar sortBy: apenas permitir chaves que existem no modelo Institution
          let validSortBy: keyof Institution | undefined = undefined;
          if (sortBy) {
            const institutionModelKeys = [
              'id', 'name', 'code', 'type', 'characteristics',
              'address', 'phone', 'email', 'is_active',
              'created_at', 'updated_at'
            ] as Array<keyof Institution>;

            if (institutionModelKeys.includes(sortBy as keyof Institution)) {
              validSortBy = sortBy as keyof Institution;
            } else {
              this.logger.warn(`Invalid sortBy field received: ${sortBy}. Defaulting to no sort or repository default.`);
            }
          }

          // Executar consultas em paralelo para melhorar o desempenho
          const [total, institutions] = await Promise.all([
            this.institutionRepository.count(queryFilters),
            this.institutionRepository.findAllWithFilters(
              queryFilters,
              { page, limit },
              validSortBy,
              sortOrder
            )
          ]);

          const paginationResult = this.calculatePagination(total, page, limit);
          const institutionDtos = institutions.map(this.mapToDto);

          return {
            success: true,
            data: {
              institution: institutionDtos,
              pagination: paginationResult,
            },
          };
        },
        // Tempo de cache: 5 minutos para consultas normais, 15 minutos para listas de instituições ativas
        is_active === true ? 900 : 300
      );
    } catch (error) {
      this.logger.error('Error finding institutions with filters', { filters }, error as Error);
      return { success: false, error: 'Failed to retrieve institutions' };
    }
  }

  async findInstitutionDetails(id: string): Promise<ServiceResult<InstitutionDto>> {
    this.logger.debug('Finding institution details by ID', { id });
    const result = await super.findById(id);
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to retrieve institution details',
        errors: result.errors || [] // Garante que errors seja um array se for undefined
      };
    }
    // Se houve sucesso e data existe, mapeia para DTO
    if (result.data) {
      return { success: true, data: this.mapToDto(result.data) };
    }
    // Caso inesperado onde success é true mas data é undefined
    this.logger.warn('Institution found by BaseService but data is undefined', { id });
    return { success: false, error: 'Failed to retrieve institution details, data undefined' };
  }
  
  async findByCode(code: string): Promise<ServiceResult<InstitutionDto>> {
    this.logger.debug('Finding institution by code', { code });
    try {
      const institution = await this.institutionRepository.findByCode(code);
      if (!institution) {
        return { success: false, error: 'Institution not found' };
      }
      return { success: true, data: this.mapToDto(institution) };
    } catch (error) {
      this.logger.error('Error finding institution by code', { code }, error as Error);
      return { success: false, error: 'Failed to retrieve institution by code' };
    }
  }

  async createInstitution(data: CreateInstitutionDto, userId?: string): Promise<ServiceResult<InstitutionDto>> {
    this.logger.debug('Creating institution', { data, userId });
    
    // Validação específica do serviço
    const existingByCode = await this.institutionRepository.findByCode(data.code);
    if (existingByCode) {
      return { success: false, error: 'Institution with this code already exists', errors: [{ field: 'code', message: 'Code already in use' }] };
    }
    if (data.email) {
        const existingByEmail = await this.institutionRepository.findByEmail(data.email);
        if (existingByEmail) {
            return { success: false, error: 'Institution with this email already exists', errors: [{ field: 'email', message: 'Email already in use' }] };
        }
    }

    const result = await super.create(data, userId);
    if (!result.success || !result.data) {
      return result;
    }
    return { success: true, data: this.mapToDto(result.data) };
  }

  async updateInstitution(id: string, data: UpdateInstitutionDto, userId?: string): Promise<ServiceResult<InstitutionDto>> {
    this.logger.debug('Updating institution', { id, data, userId });

    const existingInstitution = await this.institutionRepository.findById(id);
    if (!existingInstitution) {
        return { success: false, error: 'Institution not found' };
    }

    // Validação específica do serviço
    if (data.code && data.code !== existingInstitution.code) {
      const existingByCode = await this.institutionRepository.findByCode(data.code);
      if (existingByCode) {
        return { success: false, error: 'Institution with this code already exists', errors: [{ field: 'code', message: 'Code already in use' }] };
      }
    }
    if (data.email && data.email !== existingInstitution.email) {
        const existingByEmail = await this.institutionRepository.findByEmail(data.email);
        if (existingByEmail) {
            return { success: false, error: 'Institution with this email already exists', errors: [{ field: 'email', message: 'Email already in use' }] };
        }
    }
    
    const result = await super.update(id, data, userId);
    if (!result.success || !result.data) {
      return result;
    }
    return { success: true, data: this.mapToDto(result.data) };
  }

  async deleteInstitution(id: string, userId?: string): Promise<ServiceResult<boolean>> {
    this.logger.debug('Deleting institution', { id, userId });
    // Adicionar lógica de validação se necessário (ex: verificar se há entidades dependentes)
    return super.delete(id, userId);
  }

  async getInstitutionStats(id: string): Promise<ServiceResult<InstitutionStatsDto>> {
    this.logger.debug('Getting institution stats', { id });
    try {
      const institutionExists = await this.institutionRepository.findById(id);
      if (!institutionExists) {
        return { success: false, error: 'Institution not found' };
      }
      
      const statsData = await this.institutionRepository.getStatistics(id);

      if (!statsData) {
        // Se não houver estatísticas (ex: instituição recém-criada sem dados associados)
        // podemos retornar estatísticas zeradas ou um erro específico.
        // Por ora, retornaremos zerado para compatibilidade com InstitutionStatsDto.
        const zeroStats: InstitutionStatsDto = {
          totalStudents: 0,
          totalTeachers: 0,
          totalCourses: 0,
          totalClasses: 0, // Assumindo 0 pois a query não retorna
        };
        return { success: true, data: zeroStats };
        // Ou: return { success: false, error: 'Statistics not available for this institution' };
      }

      // Mapear os dados retornados pelo repositório para InstitutionStatsDto
      // A query do repositório retorna totalUsers, que não está no DTO.
      // O DTO espera totalClasses, que a query não retorna.
      const mappedStats: InstitutionStatsDto = {
        totalStudents: statsData.totalStudents,
        totalTeachers: statsData.totalTeachers,
        totalCourses: statsData.totalCourses,
        totalClasses: 0, // Assumindo 0 por enquanto
      };
      return { success: true, data: mappedStats };
    } catch (error) {
      this.logger.error('Error getting institution stats', { id }, error as Error);
      return { success: false, error: 'Failed to retrieve institution statistics' };
    }
  }

  private mapToDto(institution: Institution): InstitutionDto {
    // Omitir campos se necessário ou transformar dados
    const dto: InstitutionDto = {
      id: institution.id,
      name: institution.name,
      code: institution.code,
      type: institution.type,
      created_at: institution.created_at,
      updated_at: institution.updated_at,
      is_active: institution.is_active,
    };

    // Campos opcionais
    if (institution.address !== undefined) dto.address = institution.address;
    if (institution.city !== undefined) dto.city = institution.city;
    if (institution.state !== undefined) dto.state = institution.state;
    if (institution.zip_code !== undefined) dto.zip_code = institution.zip_code;
    if (institution.phone !== undefined) dto.phone = institution.phone;
    if (institution.email !== undefined) dto.email = institution.email;
    if (institution.website !== undefined) dto.website = institution.website;

    return dto;
  }

  private calculatePagination(totalItems: number, page: number, limit: number): PaginationResult {
    const totalPages = Math.ceil(totalItems / limit);
    return {
      total: totalItems,
      limit,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }
}