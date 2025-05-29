import { 
  SchoolDto, 
  CreateSchoolDto, 
  UpdateSchoolDto, 
  SchoolFilterDto,
  PaginatedSchoolsDto,
  SchoolStatsDto
} from '../dto/SchoolDto';
import { SchoolRepository } from '../repositories/SchoolRepository';
import { AppError } from '../utils/AppError';

export class SchoolService {
  private schoolRepository: SchoolRepository;

  constructor() {
    this.schoolRepository = new SchoolRepository();
  }

  async create(data: CreateSchoolDto): Promise<SchoolDto> {
    // Verificar se o código já existe
    const existingSchool = await this.schoolRepository.findByCode(data.code);
    if (existingSchool) {
      throw new AppError('Já existe uma escola com este código', 400);
    }

    const school = await this.schoolRepository.create(data);
    return this.toDto(school);
  }

  async update(id: string, data: UpdateSchoolDto): Promise<SchoolDto> {
    // Verificar se a escola existe
    const existingSchool = await this.schoolRepository.findById(id);
    if (!existingSchool) {
      throw new AppError('Escola não encontrada', 404);
    }

    // Se estiver atualizando o código, verificar unicidade
    if (data.code && data.code !== existingSchool.code) {
      const codeExists = await this.schoolRepository.findByCode(data.code);
      if (codeExists) {
        throw new AppError('Já existe uma escola com este código', 400);
      }
    }

    const updatedSchool = await this.schoolRepository.update(id, data);
    if (!updatedSchool) {
      throw new AppError('Erro ao atualizar escola', 500);
    }

    return this.toDto(updatedSchool);
  }

  async findById(id: string): Promise<SchoolDto> {
    const school = await this.schoolRepository.findById(id);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    return this.toDto(school);
  }

  async findByInstitution(institutionId: string): Promise<SchoolDto[]> {
    const schools = await this.schoolRepository.findByInstitution(institutionId);
    return schools.map(school => this.toDto(school));
  }

  async findWithPagination(filter: SchoolFilterDto): Promise<PaginatedSchoolsDto> {
    const result = await this.schoolRepository.findWithPagination(filter);
    
    return {
      schools: result.schools.map(school => this.toDto(school)),
      pagination: result.pagination
    };
  }

  async getStats(schoolId: string): Promise<SchoolStatsDto> {
    // Verificar se a escola existe
    const school = await this.schoolRepository.findById(schoolId);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    return await this.schoolRepository.getStats(schoolId);
  }

  async delete(id: string): Promise<void> {
    const school = await this.schoolRepository.findById(id);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    // Em vez de deletar, desativar a escola
    await this.schoolRepository.update(id, { is_active: false });
  }

  async activate(id: string): Promise<SchoolDto> {
    const school = await this.schoolRepository.findById(id);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    const updatedSchool = await this.schoolRepository.update(id, { is_active: true });
    if (!updatedSchool) {
      throw new AppError('Erro ao ativar escola', 500);
    }

    return this.toDto(updatedSchool);
  }

  private toDto(school: any): SchoolDto {
    return {
      id: school.id,
      name: school.name,
      code: school.code,
      institution_id: school.institution_id,
      address: school.address,
      city: school.city,
      state: school.state,
      zip_code: school.zip_code,
      phone: school.phone,
      email: school.email,
      is_active: school.is_active,
      created_at: school.created_at,
      updated_at: school.updated_at
    };
  }
}