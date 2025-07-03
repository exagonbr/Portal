import bcrypt from 'bcryptjs';
import { BaseService } from '../common/BaseService';
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

export class UserService extends BaseService<User, CreateUserDto, UpdateUserDto> {
  private userRepository: UserRepository;

  constructor() {
    const userRepository = new UserRepository();
    super(userRepository, 'users');
    this.userRepository = userRepository;
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
        users = await this.userRepository.searchUsers(filters.search, filters.institution_id);
      } else if (filters.role) {
        users = await this.userRepository.findByRole(filters.role);
      } else if (filters.institution_id) {
        users = await this.userRepository.findByInstitution(filters.institution_id);
      } else {
        users = await this.userRepository.getUsersWithRoleAndInstitution();
      }

      // Aplicar filtros adicionais no resultado
      if (filters.name) {
        users = users.filter(user => 
          user.name.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }
      
      if (filters.email) {
        users = users.filter(user => 
          user.email.toLowerCase().includes(filters.email!.toLowerCase())
        );
      }
      
      if (filters.role_id) {
        users = users.filter(user => user.role_id === filters.role_id);
      }
      
      if (filters.is_active !== undefined) {
        users = users.filter(user => user.is_active === filters.is_active);
      }
      
      // Ordenar os resultados
      if (filters.sortBy) {
        const sortField = filters.sortBy;
        const sortDir = filters.sortOrder === 'desc' ? -1 : 1;
        
        users.sort((a, b) => {
          if (a[sortField] < b[sortField]) return -1 * sortDir;
          if (a[sortField] > b[sortField]) return 1 * sortDir;
          return 0;
        });
      }

      // Sanitizar dados sensíveis
      const sanitizedUsers = users.map(user => this.sanitizeData(user)) as UserResponseDto[];

      const total = sanitizedUsers.length;
      
      // Aplicar paginação após a filtragem
      const paginatedUsers = sanitizedUsers.slice(
        pagination.offset, 
        pagination.offset + pagination.limit
      );
      
      const paginationResult = {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page * pagination.limit < total,
        hasPrev: pagination.page > 1
      };

      this.logger.info(`Found ${paginatedUsers.length} users of total ${total} with filters`);

      return {
        success: true,
        data: {
          users: paginatedUsers,
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

      const user = await this.userRepository.getUserWithRoleAndInstitution(id);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const sanitizedUser = this.sanitizeData(user) as UserWithRoleDto;

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

      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const sanitizedUser = this.sanitizeData(user) as UserResponseDto;

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

      const courses = await this.userRepository.getUserCourses(userId);

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
      const user = await this.userRepository.findById(userId);
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

      await this.userRepository.updateLastLogin(userId);

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

  // Sobrescrever métodos de validação
  protected override async validateCreate(data: CreateUserDto): Promise<ServiceResult<void>> {
    const errors: string[] = [];

    // Validar email único
    const existingEmail = await this.userRepository.findByEmail(data.email);
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

  protected override async validateUpdate(id: string, data: UpdateUserDto, existingEntity: User): Promise<ServiceResult<void>> {
    const errors: string[] = [];

    // Validar email único (se está sendo alterado)
    if (data.email && data.email !== existingEntity.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
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

  // Sobrescrever preparação de dados
  protected override async prepareCreateData(data: CreateUserDto, userId?: string): Promise<any> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    return {
      ...data,
      password: hashedPassword
    };
  }

  protected override async prepareUpdateData(data: UpdateUserDto, existingEntity: User, userId?: string): Promise<any> {
    const preparedData = { ...data };

    // Hash da senha se estiver sendo alterada
    if (data.password) {
      const saltRounds = 12;
      preparedData.password = await bcrypt.hash(data.password, saltRounds);
    }

    return preparedData;
  }

  // Hooks de ciclo de vida
  protected override async afterCreate(entity: User, userId?: string): Promise<void> {
    this.logger.businessLogic('User created', entity.id, {
      email: entity.email,
      name: entity.name,
      createdBy: userId
    });
  }

  protected override async afterUpdate(updatedEntity: User, previousEntity: User, userId?: string): Promise<void> {
    this.logger.businessLogic('User updated', updatedEntity.id, {
      changes: this.getChanges(previousEntity, updatedEntity),
      updatedBy: userId
    });
  }

  protected override async afterDelete(entity: User, userId?: string): Promise<void> {
    this.logger.businessLogic('User deleted', entity.id, {
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
}