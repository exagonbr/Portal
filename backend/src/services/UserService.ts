import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { User } from '../models/User';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UserResponseDto, 
  UserWithRoleDto,
  ChangePasswordDto,
  UserFilterDto,
  UserCourseDto
} from '../dto/UserDto';
import { ServiceResult, PaginationParams } from '../types/common';

export class UserService {
  private userRepository: UserRepository;
  private logger = console; // Logger simples

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Métodos utilitários básicos
  private sanitizeData(data: any): any {
    const { password, ...sanitized } = data;
    return sanitized;
  }

  private isValidId(id: string): boolean {
    return Boolean(id && id.length > 0);
  }

  /**
   * Busca usuários com filtros avançados
   */
  async findUsersWithFilters(filters: UserFilterDto): Promise<ServiceResult<{ users: UserResponseDto[]; pagination: any }>> {
    try {
      this.logger.debug('Finding users with filters', filters);

      const pagination: PaginationParams = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        offset: ((filters.page || 1) - 1) * (filters.limit || 10)
      };

      let users: any[];

      if (filters.search) {
        users = await UserRepository.searchUsers(filters.search, filters.institution_id);
      } else if (filters.role) {
        users = await UserRepository.findByRole(filters.role);
      } else if (filters.institution_id) {
        users = await UserRepository.findByInstitution(filters.institution_id);
      } else {
        users = await UserRepository.getUsersWithRoleAndInstitution();
      }

      // Sanitizar dados sensíveis
      const sanitizedUsers = users.map(user => this.sanitizeData(user)) as UserResponseDto[];

      const total = sanitizedUsers.length;
      const paginationResult = {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page * pagination.limit < total,
        hasPrev: pagination.page > 1
      };

      this.logger.info(`Found ${sanitizedUsers.length} users with filters`);

      return {
        success: true,
        data: {
          users: sanitizedUsers,
          pagination: paginationResult
        }
      };
    } catch (error) {
      this.logger.error('Error finding users with filters', filters, error as Error);
      return {
        success: false,
        error: 'Failed to retrieve users'
      };
    }
  }

  /**
   * Busca usuário por ID com informações de role e instituição
   */
  async findUserWithDetails(id: string): Promise<ServiceResult<UserWithRoleDto>> {
    try {
      this.logger.debug('Finding user with details', { id });

      if (!this.isValidId(id)) {
        return {
          success: false,
          error: 'Invalid user ID format'
        };
      }

      const user = await UserRepository.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const sanitizedUser = this.sanitizeData(user) as unknown as UserWithRoleDto;

      this.logger.info('Found user with details', { id });

      return {
        success: true,
        data: sanitizedUser
      };
    } catch (error) {
      this.logger.error('Error finding user with details', { id }, error as Error);
      return {
        success: false,
        error: 'Failed to retrieve user'
      };
    }
  }

  /**
   * Busca usuário por email
   */
  async findByEmail(email: string): Promise<ServiceResult<UserResponseDto>> {
    try {
      this.logger.debug('Finding user by email', { email });

      const user = await UserRepository.findByEmail(email);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const sanitizedUser = this.sanitizeData(user) as unknown as UserResponseDto;

      this.logger.info('Found user by email', { email });

      return {
        success: true,
        data: sanitizedUser
      };
    } catch (error) {
      this.logger.error('Error finding user by email', { email }, error as Error);
      return {
        success: false,
        error: 'Failed to retrieve user'
      };
    }
  }


  /**
   * Busca cursos do usuário
   */
  async getUserCourses(userId: string): Promise<ServiceResult<UserCourseDto[]>> {
    try {
      this.logger.debug('Getting user courses', { userId });

      if (!this.isValidId(userId)) {
        return {
          success: false,
          error: 'Invalid user ID format'
        };
      }

      // TODO: Implementar getUserCourses no UserRepository
      const courses: UserCourseDto[] = [];

      this.logger.info(`Found ${courses.length} courses for user`, { userId });

      return {
        success: true,
        data: courses
      };
    } catch (error) {
      this.logger.error('Error getting user courses', { userId }, error as Error);
      return {
        success: false,
        error: 'Failed to retrieve user courses'
      };
    }
  }

  /**
   * Altera senha do usuário
   */
  async changePassword(userId: string, passwordData: ChangePasswordDto): Promise<ServiceResult<boolean>> {
    try {
      this.logger.debug('Changing user password', { userId });

      if (!this.isValidId(userId)) {
        return {
          success: false,
          error: 'Invalid user ID format'
        };
      }

      // Busca o usuário com senha
      const user = await UserRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Verifica senha atual
      const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }

      // Hash da nova senha
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, saltRounds);

      // Atualiza a senha
      await this.userRepository.updateUser(userId, { password: hashedNewPassword });

      this.logger.info('Password changed successfully', { userId });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      this.logger.error('Error changing password', { userId }, error as Error);
      return {
        success: false,
        error: 'Failed to change password'
      };
    }
  }

  /**
   * Atualiza último login do usuário
   */
  async updateLastLogin(userId: string): Promise<ServiceResult<boolean>> {
    try {
      this.logger.debug('Updating last login', { userId });

      if (!this.isValidId(userId)) {
        return {
          success: false,
          error: 'Invalid user ID format'
        };
      }

      await UserRepository.updateLastLogin(userId);

      this.logger.info('Last login updated', { userId });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      this.logger.error('Error updating last login', { userId }, error as Error);
      return {
        success: false,
        error: 'Failed to update last login'
      };
    }
  }

  /**
   * Obtém estatísticas dos usuários
   */
  async getUserStats(institutionFilter?: string): Promise<ServiceResult<any>> {
    try {
      this.logger.debug('Getting user statistics', { institutionFilter });

      const stats = await UserRepository.getUserStatistics(institutionFilter);

      this.logger.info('User statistics retrieved successfully');

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.logger.error('Error getting user statistics', { institutionFilter }, error as Error);
      return {
        success: false,
        error: 'Failed to retrieve user statistics'
      };
    }
  }

  // Métodos de validação
  protected async validateCreate(data: CreateUserDto): Promise<ServiceResult<void>> {
    const errors: string[] = [];

    // Validar email único
    const existingEmail = await UserRepository.findByEmail(data.email);
    if (existingEmail) {
      errors.push('Email already exists');
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Invalid email format');
    }

    // Validar senha
    if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: 'Validation failed',
        errors
      };
    }

    return { success: true };
  }

  protected async validateUpdate(id: string, data: UpdateUserDto, existingEntity: User): Promise<ServiceResult<void>> {
    const errors: string[] = [];

    // Validar email único (se está sendo alterado)
    if (data.email && data.email !== existingEntity.email) {
      const existingEmail = await UserRepository.findByEmail(data.email);
      if (existingEmail) {
        errors.push('Email already exists');
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      }
    }

    // Validar senha (se está sendo alterada)
    if (data.password && data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: 'Validation failed',
        errors
      };
    }

    return { success: true };
  }

  // Preparação de dados
  protected async prepareCreateData(data: CreateUserDto, userId?: string): Promise<any> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    return {
      ...data,
      password: hashedPassword
    };
  }

  protected async prepareUpdateData(data: UpdateUserDto, existingEntity: User, userId?: string): Promise<any> {
    const preparedData = { ...data };

    // Hash da senha se estiver sendo alterada
    if (data.password) {
      const saltRounds = 12;
      preparedData.password = await bcrypt.hash(data.password, saltRounds);
    }

    return preparedData;
  }

  // Hooks de ciclo de vida
  protected async afterCreate(entity: User, userId?: string): Promise<void> {
    this.logger.log('User created', entity.id, {
      email: entity.email,
      name: entity.name,
      createdBy: userId
    });
  }

  protected async afterUpdate(updatedEntity: User, previousEntity: User, userId?: string): Promise<void> {
    this.logger.log('User updated', updatedEntity.id, {
      changes: this.getChanges(previousEntity, updatedEntity),
      updatedBy: userId
    });
  }

  protected async afterDelete(entity: User, userId?: string): Promise<void> {
    this.logger.log('User deleted', entity.id, {
      email: entity.email,
      name: entity.name,
      deletedBy: userId
    });
  }

  private getChanges(oldEntity: User, newEntity: User): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};
    
    Object.keys(newEntity).forEach(key => {
      if (key !== 'password' && key !== 'updated_at' && oldEntity[key as keyof User] !== newEntity[key as keyof User]) {
        changes[key] = {
          from: oldEntity[key as keyof User],
          to: newEntity[key as keyof User]
        };
      }
    });

    return changes;
  }

  /**
   * Cria um novo usuário
   */
  async create(userData: CreateUserDto, userId?: string): Promise<ServiceResult<any>> {
    try {
      this.logger.debug('Creating user', userData);

      // Validar dados
      const validation = await this.validateCreate(userData);
      if (!validation.success) {
        return validation;
      }

      // Preparar dados
      const preparedData = await this.prepareCreateData(userData, userId);

      // Criar usuário
      const user = await UserRepository.create(preparedData);

      // Hook pós-criação
      await this.afterCreate(user as any, userId);

      return {
        success: true,
        data: this.sanitizeData(user)
      };
    } catch (error) {
      this.logger.error('Error creating user', error as Error);
      return {
        success: false,
        error: 'Failed to create user'
      };
    }
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, updateData: UpdateUserDto, userId?: string): Promise<ServiceResult<any>> {
    try {
      this.logger.debug('Updating user', { id, updateData });

      // Buscar usuário existente
      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Validar dados
      const validation = await this.validateUpdate(id, updateData, existingUser as any);
      if (!validation.success) {
        return validation;
      }

      // Preparar dados
      const preparedData = await this.prepareUpdateData(updateData, existingUser as any, userId);

      // Atualizar usuário
      const updatedUser = await UserRepository.update(id, preparedData);

      if (!updatedUser) {
        return {
          success: false,
          error: 'Failed to update user'
        };
      }

      // Hook pós-atualização
      await this.afterUpdate(updatedUser as any, existingUser as any, userId);

      return {
        success: true,
        data: this.sanitizeData(updatedUser)
      };
    } catch (error) {
      this.logger.error('Error updating user', error as Error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  /**
   * Busca usuário por ID
   */
  async findById(id: string): Promise<ServiceResult<any>> {
    try {
      this.logger.debug('Finding user by ID', { id });

      if (!this.isValidId(id)) {
        return {
          success: false,
          error: 'Invalid user ID format'
        };
      }

      const user = await UserRepository.findById(id);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: this.sanitizeData(user)
      };
    } catch (error) {
      this.logger.error('Error finding user by ID', error as Error);
      return {
        success: false,
        error: 'Failed to retrieve user'
      };
    }
  }

  /**
   * Remove um usuário
   */
  async delete(id: string, userId?: string): Promise<ServiceResult<boolean>> {
    try {
      this.logger.debug('Deleting user', { id });

      if (!this.isValidId(id)) {
        return {
          success: false,
          error: 'Invalid user ID format'
        };
      }

      // Buscar usuário existente
      const existingUser = await UserRepository.findById(id);
      if (!existingUser) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Remover usuário
      const deleted = await UserRepository.delete(parseInt(id, 10));

      if (!deleted) {
        return {
          success: false,
          error: 'Failed to delete user'
        };
      }

      // Hook pós-exclusão
      await this.afterDelete(existingUser as any, userId);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      this.logger.error('Error deleting user', error as Error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }
}