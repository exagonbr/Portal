import { 
  SchoolManagerDto, 
  CreateSchoolManagerDto, 
  UpdateSchoolManagerDto, 
  SchoolManagerFilterDto,
  PaginatedSchoolManagersDto,
  SchoolManagerWithDetailsDto,
  SchoolManagementTeamDto,
  ManagerHistoryDto
} from '../dto/SchoolManagerDto';
import { SchoolManagerRepository } from '../repositories/SchoolManagerRepository';
import { SchoolRepository } from '../repositories/SchoolRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/AppError';

export class SchoolManagerService {
  private schoolManagerRepository: SchoolManagerRepository;
  private schoolRepository: SchoolRepository;
  private userRepository: UserRepository;

  constructor() {
    this.schoolManagerRepository = new SchoolManagerRepository();
    this.schoolRepository = new SchoolRepository();
    this.userRepository = new UserRepository();
  }

  async create(data: CreateSchoolManagerDto): Promise<SchoolManagerDto> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(data.user_id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar se a escola existe
    const school = await this.schoolRepository.findById(data.school_id);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    // Verificar se a escola está ativa
    if (!school.is_active) {
      throw new AppError('Não é possível adicionar gestor a uma escola inativa', 400);
    }

    // Verificar se já existe um gestor ativo com o mesmo cargo
    const existingManager = await this.schoolManagerRepository.checkManagerExists(
      data.user_id,
      data.school_id,
      data.position
    );
    if (existingManager) {
      throw new AppError('Este usuário já possui este cargo nesta escola', 400);
    }

    // Verificar disponibilidade do cargo (ex: apenas um diretor por escola)
    const positionAvailable = await this.schoolManagerRepository.checkPositionAvailable(
      data.school_id,
      data.position,
      data.user_id
    );
    if (!positionAvailable) {
      throw new AppError('Este cargo já está ocupado nesta escola', 400);
    }

    const manager = await this.schoolManagerRepository.create(data);
    return this.toDto(manager);
  }

  async update(id: string, data: UpdateSchoolManagerDto): Promise<SchoolManagerDto> {
    // Verificar se o gestor existe
    const existingManager = await this.schoolManagerRepository.findById(id);
    if (!existingManager) {
      throw new AppError('Gestor não encontrado', 404);
    }

    // Se estiver mudando usuário, verificar se existe
    if (data.user_id && data.user_id !== existingManager.user_id) {
      const user = await this.userRepository.findById(data.user_id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }
    }

    // Se estiver mudando escola, verificar se existe
    if (data.school_id && data.school_id !== existingManager.school_id) {
      const school = await this.schoolRepository.findById(data.school_id);
      if (!school) {
        throw new AppError('Escola não encontrada', 404);
      }
    }

    // Se estiver mudando cargo, verificar disponibilidade
    if (data.position && data.position !== existingManager.position) {
      const schoolId = data.school_id || existingManager.school_id;
      const positionAvailable = await this.schoolManagerRepository.checkPositionAvailable(
        schoolId,
        data.position,
        existingManager.user_id
      );
      if (!positionAvailable) {
        throw new AppError('Este cargo já está ocupado nesta escola', 400);
      }
    }

    const updatedManager = await this.schoolManagerRepository.update(id, data);
    if (!updatedManager) {
      throw new AppError('Erro ao atualizar gestor', 500);
    }

    return this.toDto(updatedManager);
  }

  async findById(id: string): Promise<SchoolManagerDto> {
    const manager = await this.schoolManagerRepository.findById(id);
    if (!manager) {
      throw new AppError('Gestor não encontrado', 404);
    }

    return this.toDto(manager);
  }

  async findActiveBySchool(schoolId: string): Promise<SchoolManagerDto[]> {
    // Verificar se a escola existe
    const school = await this.schoolRepository.findById(schoolId);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    const managers = await this.schoolManagerRepository.findActiveBySchool(schoolId);
    return managers.map(m => this.toDto(m));
  }

  async findActiveByUser(userId: string): Promise<SchoolManagerDto[]> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const managers = await this.schoolManagerRepository.findActiveByUser(userId);
    return managers.map(m => this.toDto(m));
  }

  async findWithPagination(filter: SchoolManagerFilterDto): Promise<PaginatedSchoolManagersDto> {
    const result = await this.schoolManagerRepository.findWithPagination(filter);
    
    return {
      school_managers: result.school_managers.map(m => this.toDto(m)),
      pagination: result.pagination
    };
  }

  async getWithDetails(managerId: string): Promise<SchoolManagerWithDetailsDto> {
    const details = await this.schoolManagerRepository.getWithDetails(managerId);
    if (!details) {
      throw new AppError('Gestor não encontrado', 404);
    }

    return details;
  }

  async getSchoolManagementTeam(schoolId: string): Promise<SchoolManagementTeamDto> {
    // Verificar se a escola existe
    const school = await this.schoolRepository.findById(schoolId);
    if (!school) {
      throw new AppError('Escola não encontrada', 404);
    }

    return await this.schoolManagerRepository.getSchoolManagementTeam(schoolId);
  }

  async getManagerHistory(userId: string): Promise<ManagerHistoryDto> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return await this.schoolManagerRepository.getManagerHistory(userId);
  }

  async deactivateManager(userId: string, schoolId: string, position: string): Promise<void> {
    // Verificar se o gestor existe e está ativo
    const managers = await this.schoolManagerRepository.findByUserAndSchool(userId, schoolId);
    const activeManager = managers.find(m => m.position === position && m.is_active);
    
    if (!activeManager) {
      throw new AppError('Gestor não encontrado ou já está inativo', 404);
    }

    const success = await this.schoolManagerRepository.deactivateManager(userId, schoolId, position);
    if (!success) {
      throw new AppError('Erro ao desativar gestor', 500);
    }
  }

  async reactivateManager(managerId: string): Promise<SchoolManagerDto> {
    const manager = await this.schoolManagerRepository.findById(managerId);
    if (!manager) {
      throw new AppError('Gestor não encontrado', 404);
    }

    if (manager.is_active) {
      throw new AppError('O gestor já está ativo', 400);
    }

    // Verificar se a escola ainda está ativa
    const school = await this.schoolRepository.findById(manager.school_id);
    if (!school || !school.is_active) {
      throw new AppError('Não é possível reativar gestor em uma escola inativa', 400);
    }

    // Verificar se o cargo está disponível
    const positionAvailable = await this.schoolManagerRepository.checkPositionAvailable(
      manager.school_id,
      manager.position,
      manager.user_id
    );
    if (!positionAvailable) {
      throw new AppError('Este cargo já está ocupado nesta escola', 400);
    }

    const updatedManager = await this.schoolManagerRepository.update(managerId, {
      is_active: true
    });

    if (!updatedManager) {
      throw new AppError('Erro ao reativar gestor', 500);
    }

    return this.toDto(updatedManager);
  }

  private toDto(manager: any): SchoolManagerDto {
    return {
      id: manager.id,
      user_id: manager.user_id,
      school_id: manager.school_id,
      position: manager.position,
      start_date: manager.start_date,
      end_date: manager.end_date,
      is_active: manager.is_active,
      created_at: manager.created_at,
      updated_at: manager.updated_at
    };
  }
}