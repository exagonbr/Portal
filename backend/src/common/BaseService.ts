import { BaseRepository } from '../repositories/BaseRepository';
import { Logger } from '../utils/Logger';
import { ServiceResult, PaginationParams, PaginationResult, FilterOptions } from '../types/common';

export abstract class BaseService<T, CreateData, UpdateData> {
  protected repository: BaseRepository<T>;
  protected logger: Logger;
  protected entityName: string;

  constructor(repository: BaseRepository<T>, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
    this.logger = new Logger(`${entityName}Service`);
  }

  /**
   * Busca todas as entidades com paginação e filtros
   */
  async findAll(
    pagination?: PaginationParams,
    filters?: FilterOptions
  ): Promise<ServiceResult<{ items: T[]; pagination: PaginationResult }>> {
    try {
      this.logger.debug(`Finding all ${this.entityName}s`, { pagination, filters });

      const total = await this.repository.count(filters?.where as Partial<T>);
      const items = await this.repository.findAll(filters?.where as Partial<T>, pagination);

      const paginationResult: PaginationResult = {
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
        hasNext: (pagination?.page || 1) * (pagination?.limit || 10) < total,
        hasPrev: (pagination?.page || 1) > 1
      };

      this.logger.info(`Found ${items.length} ${this.entityName}s`);

      return {
        success: true,
        data: { items, pagination: paginationResult }
      };
    } catch (error) {
      this.logger.error(`Error finding ${this.entityName}s`, { pagination, filters }, error as Error);
      return {
        success: false,
        error: `Failed to retrieve ${this.entityName}s`
      };
    }
  }

  /**
   * Busca uma entidade por ID
   */
  async findById(id: string): Promise<ServiceResult<T>> {
    try {
      this.logger.debug(`Finding ${this.entityName} by ID`, { id });

      if (!this.isValidId(id)) {
        return {
          success: false,
          error: 'Invalid ID format'
        };
      }

      const entity = await this.repository.findById(id);

      if (!entity) {
        this.logger.warn(`${this.entityName} not found`, { id });
        return {
          success: false,
          error: `${this.entityName} not found`
        };
      }

      this.logger.info(`Found ${this.entityName}`, { id });
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      this.logger.error(`Error finding ${this.entityName} by ID`, { id }, error as Error);
      return {
        success: false,
        error: `Failed to retrieve ${this.entityName}`
      };
    }
  }

  /**
   * Cria uma nova entidade
   */
  async create(data: CreateData, userId?: string): Promise<ServiceResult<T>> {
    try {
      this.logger.debug(`Creating ${this.entityName}`, { data, userId });

      // Validação customizada (pode ser sobrescrita)
      const validationResult = await this.validateCreate(data);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error || 'Validation failed',
          ...(validationResult.errors && { errors: validationResult.errors })
        };
      }

      // Preparação dos dados (pode ser sobrescrita)
      const preparedData = await this.prepareCreateData(data, userId);

      const entity = await this.repository.create(preparedData);

      this.logger.info(`Created ${this.entityName}`, { id: (entity as any).id, userId });

      // Hook pós-criação (pode ser sobrescrita)
      await this.afterCreate(entity, userId);

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      this.logger.error(`Error creating ${this.entityName}`, { data, userId }, error as Error);
      return {
        success: false,
        error: `Failed to create ${this.entityName}`
      };
    }
  }

  /**
   * Atualiza uma entidade
   */
  async update(id: string, data: UpdateData, userId?: string): Promise<ServiceResult<T>> {
    try {
      this.logger.debug(`Updating ${this.entityName}`, { id, data, userId });

      if (!this.isValidId(id)) {
        return {
          success: false,
          error: 'Invalid ID format'
        };
      }

      // Verifica se a entidade existe
      const existingEntity = await this.repository.findById(id);
      if (!existingEntity) {
        return {
          success: false,
          error: `${this.entityName} not found`
        };
      }

      // Validação customizada (pode ser sobrescrita)
      const validationResult = await this.validateUpdate(id, data, existingEntity);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error || 'Validation failed',
          ...(validationResult.errors && { errors: validationResult.errors })
        };
      }

      // Preparação dos dados (pode ser sobrescrita)
      const preparedData = await this.prepareUpdateData(data, existingEntity, userId);

      const updatedEntity = await this.repository.update(id, preparedData);

      if (!updatedEntity) {
        return {
          success: false,
          error: `Failed to update ${this.entityName}`
        };
      }

      this.logger.info(`Updated ${this.entityName}`, { id, userId });

      // Hook pós-atualização (pode ser sobrescrita)
      await this.afterUpdate(updatedEntity, existingEntity, userId);

      return {
        success: true,
        data: updatedEntity
      };
    } catch (error) {
      this.logger.error(`Error updating ${this.entityName}`, { id, data, userId }, error as Error);
      return {
        success: false,
        error: `Failed to update ${this.entityName}`
      };
    }
  }

  /**
   * Remove uma entidade
   */
  async delete(id: string, userId?: string): Promise<ServiceResult<boolean>> {
    try {
      this.logger.debug(`Deleting ${this.entityName}`, { id, userId });

      if (!this.isValidId(id)) {
        return {
          success: false,
          error: 'Invalid ID format'
        };
      }

      // Verifica se a entidade existe
      const existingEntity = await this.repository.findById(id);
      if (!existingEntity) {
        return {
          success: false,
          error: `${this.entityName} not found`
        };
      }

      // Validação customizada (pode ser sobrescrita)
      const validationResult = await this.validateDelete(id, existingEntity);
      if (!validationResult.success) {
        return {
          success: false,
          error: validationResult.error || 'Validation failed',
          ...(validationResult.errors && { errors: validationResult.errors })
        };
      }

      // Hook pré-exclusão (pode ser sobrescrita)
      await this.beforeDelete(existingEntity, userId);

      const deleted = await this.repository.delete(id);

      if (!deleted) {
        return {
          success: false,
          error: `Failed to delete ${this.entityName}`
        };
      }

      this.logger.info(`Deleted ${this.entityName}`, { id, userId });

      // Hook pós-exclusão (pode ser sobrescrita)
      await this.afterDelete(existingEntity, userId);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      this.logger.error(`Error deleting ${this.entityName}`, { id, userId }, error as Error);
      return {
        success: false,
        error: `Failed to delete ${this.entityName}`
      };
    }
  }

  // Métodos de validação (podem ser sobrescritos)
  protected async validateCreate(data: CreateData): Promise<ServiceResult<void>> {
    return { success: true };
  }

  protected async validateUpdate(id: string, data: UpdateData, existingEntity: T): Promise<ServiceResult<void>> {
    return { success: true };
  }

  protected async validateDelete(id: string, existingEntity: T): Promise<ServiceResult<void>> {
    return { success: true };
  }

  // Métodos de preparação de dados (podem ser sobrescritos)
  protected async prepareCreateData(data: CreateData, userId?: string): Promise<any> {
    return data;
  }

  protected async prepareUpdateData(data: UpdateData, existingEntity: T, userId?: string): Promise<any> {
    return data;
  }

  // Hooks de ciclo de vida (podem ser sobrescritos)
  protected async afterCreate(entity: T, userId?: string): Promise<void> {
    // Override in subclasses
  }

  protected async afterUpdate(updatedEntity: T, previousEntity: T, userId?: string): Promise<void> {
    // Override in subclasses
  }

  protected async beforeDelete(entity: T, userId?: string): Promise<void> {
    // Override in subclasses
  }

  protected async afterDelete(entity: T, userId?: string): Promise<void> {
    // Override in subclasses
  }

  // Utilitários
  protected isValidId(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  protected sanitizeData<U extends Record<string, any>>(data: U, fieldsToRemove: string[] = ['password']): Partial<U> {
    const sanitized = { ...data };
    fieldsToRemove.forEach(field => {
      delete sanitized[field];
    });
    return sanitized;
  }
}