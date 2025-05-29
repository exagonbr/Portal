import { 
  UserClassDto, 
  CreateUserClassDto, 
  UpdateUserClassDto, 
  UserClassFilterDto,
  PaginatedUserClassesDto,
  UserClassWithDetailsDto,
  ClassEnrollmentSummaryDto,
  UserEnrollmentHistoryDto
} from '../dto/UserClassDto';
import { UserClassRepository } from '../repositories/UserClassRepository';
import { ClassRepository } from '../repositories/ClassRepository';
import { UserRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/AppError';

export class UserClassService {
  private userClassRepository: UserClassRepository;
  private classRepository: ClassRepository;
  private userRepository: UserRepository;

  constructor() {
    this.userClassRepository = new UserClassRepository();
    this.classRepository = new ClassRepository();
    this.userRepository = new UserRepository();
  }

  async create(data: CreateUserClassDto): Promise<UserClassDto> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(data.user_id);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(data.class_id);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    // Verificar se a turma está ativa
    if (!classEntity.is_active) {
      throw new AppError('Não é possível matricular em uma turma inativa', 400);
    }

    // Verificar se já existe matrícula ativa
    const existingEnrollment = await this.userClassRepository.findByUserAndClass(
      data.user_id,
      data.class_id,
      data.role
    );
    if (existingEnrollment && existingEnrollment.is_active) {
      throw new AppError('O usuário já está matriculado nesta turma com este papel', 400);
    }

    // Se for aluno, verificar limite de vagas
    if (data.role === 'STUDENT') {
      const stats = await this.classRepository.getStats(data.class_id);
      if (stats.totalStudents >= classEntity.max_students) {
        throw new AppError('A turma já atingiu o limite máximo de alunos', 400);
      }
    }

    // Por enquanto, vamos pular a validação do papel do usuário
    // já que precisaríamos buscar o role pelo role_id
    // this.validateUserRole(user.role_id, data.role);

    const userClass = await this.userClassRepository.create(data);
    return this.toDto(userClass);
  }

  async update(id: string, data: UpdateUserClassDto): Promise<UserClassDto> {
    // Verificar se a matrícula existe
    const existingUserClass = await this.userClassRepository.findById(id);
    if (!existingUserClass) {
      throw new AppError('Matrícula não encontrada', 404);
    }

    // Se estiver mudando usuário ou turma, validar
    if (data.user_id && data.user_id !== existingUserClass.user_id) {
      const user = await this.userRepository.findById(data.user_id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }
    }

    if (data.class_id && data.class_id !== existingUserClass.class_id) {
      const classEntity = await this.classRepository.findById(data.class_id);
      if (!classEntity) {
        throw new AppError('Turma não encontrada', 404);
      }
    }

    const updatedUserClass = await this.userClassRepository.update(id, data);
    if (!updatedUserClass) {
      throw new AppError('Erro ao atualizar matrícula', 500);
    }

    return this.toDto(updatedUserClass);
  }

  async findById(id: string): Promise<UserClassDto> {
    const userClass = await this.userClassRepository.findById(id);
    if (!userClass) {
      throw new AppError('Matrícula não encontrada', 404);
    }

    return this.toDto(userClass);
  }

  async findActiveByUser(userId: string): Promise<UserClassDto[]> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const userClasses = await this.userClassRepository.findActiveByUser(userId);
    return userClasses.map(uc => this.toDto(uc));
  }

  async findActiveByClass(classId: string): Promise<UserClassDto[]> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    const userClasses = await this.userClassRepository.findActiveByClass(classId);
    return userClasses.map(uc => this.toDto(uc));
  }

  async findWithPagination(filter: UserClassFilterDto): Promise<PaginatedUserClassesDto> {
    const result = await this.userClassRepository.findWithPagination(filter);
    
    return {
      user_classes: result.user_classes.map(uc => this.toDto(uc)),
      pagination: result.pagination
    };
  }

  async getWithDetails(userClassId: string): Promise<UserClassWithDetailsDto> {
    const details = await this.userClassRepository.getWithDetails(userClassId);
    if (!details) {
      throw new AppError('Matrícula não encontrada', 404);
    }

    return details;
  }

  async getClassEnrollmentSummary(classId: string): Promise<ClassEnrollmentSummaryDto> {
    // Verificar se a turma existe
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new AppError('Turma não encontrada', 404);
    }

    return await this.userClassRepository.getClassEnrollmentSummary(classId);
  }

  async getUserEnrollmentHistory(userId: string): Promise<UserEnrollmentHistoryDto> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return await this.userClassRepository.getUserEnrollmentHistory(userId);
  }

  async deactivateEnrollment(userId: string, classId: string): Promise<void> {
    // Verificar se a matrícula existe e está ativa
    const userClass = await this.userClassRepository.findByUserAndClass(userId, classId);
    if (!userClass) {
      throw new AppError('Matrícula não encontrada', 404);
    }

    if (!userClass.is_active) {
      throw new AppError('A matrícula já está inativa', 400);
    }

    const success = await this.userClassRepository.deactivateEnrollment(userId, classId);
    if (!success) {
      throw new AppError('Erro ao desativar matrícula', 500);
    }
  }

  async reactivateEnrollment(userClassId: string): Promise<UserClassDto> {
    const userClass = await this.userClassRepository.findById(userClassId);
    if (!userClass) {
      throw new AppError('Matrícula não encontrada', 404);
    }

    if (userClass.is_active) {
      throw new AppError('A matrícula já está ativa', 400);
    }

    // Verificar se a turma ainda está ativa
    const classEntity = await this.classRepository.findById(userClass.class_id);
    if (!classEntity || !classEntity.is_active) {
      throw new AppError('Não é possível reativar matrícula em uma turma inativa', 400);
    }

    const updatedUserClass = await this.userClassRepository.update(userClassId, {
      is_active: true
    });

    if (!updatedUserClass) {
      throw new AppError('Erro ao reativar matrícula', 500);
    }

    return this.toDto(updatedUserClass);
  }

  private validateUserRole(userRole: string, enrollmentRole: string): void {
    // Validar se o papel do usuário é compatível com o papel na matrícula
    const validCombinations: Record<string, string[]> = {
      'student': ['STUDENT'],
      'teacher': ['TEACHER', 'COORDINATOR'],
      'admin': ['STUDENT', 'TEACHER', 'COORDINATOR'],
      'manager': ['STUDENT', 'TEACHER', 'COORDINATOR']
    };

    const allowedRoles = validCombinations[userRole] || [];
    if (!allowedRoles.includes(enrollmentRole)) {
      throw new AppError(`Usuário com papel '${userRole}' não pode ser matriculado como '${enrollmentRole}'`, 400);
    }
  }

  private toDto(userClass: any): UserClassDto {
    return {
      id: userClass.id,
      user_id: userClass.user_id,
      class_id: userClass.class_id,
      role: userClass.role,
      enrollment_date: userClass.enrollment_date,
      exit_date: userClass.exit_date,
      is_active: userClass.is_active,
      created_at: userClass.created_at,
      updated_at: userClass.updated_at
    };
  }
}