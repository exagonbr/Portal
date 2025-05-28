import { Knex } from 'knex';
import db from '../../config/database';
import { Logger } from '../../utils/Logger';
import { PaginationParams, FilterOptions, RepositoryOptions } from '../../types/common';

export abstract class BaseRepository<T> {
  protected db: Knex;
  protected tableName: string;
  protected logger: Logger;

  constructor(tableName: string) {
    this.db = db;
    this.tableName = tableName;
    this.logger = new Logger(`${tableName}Repository`);
  }

  /**
   * Busca todos os registros com filtros e paginação
   */
  async findAll(
    filters?: Partial<T>, 
    pagination?: PaginationParams,
    options?: RepositoryOptions
  ): Promise<T[]> {
    try {
      this.logger.debug(`Finding all ${this.tableName}`, { filters, pagination });

      let query = this.buildBaseQuery(options);

      if (filters) {
        query = this.applyFilters(query, filters);
      }

      if (pagination) {
        query = this.applyPagination(query, pagination);
      }

      const startTime = Date.now();
      const results = await query.select('*');
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `SELECT * FROM ${this.tableName}`,
        { filters, pagination },
        duration
      );

      return results;
    } catch (error) {
      this.logger.error(`Error finding all ${this.tableName}`, { filters, pagination }, error as Error);
      throw error;
    }
  }

  /**
   * Busca um registro por ID
   */
  async findById(id: string, options?: RepositoryOptions): Promise<T | null> {
    try {
      this.logger.debug(`Finding ${this.tableName} by ID`, { id });

      const startTime = Date.now();
      const query = this.buildBaseQuery(options);
      const result = await query.where('id', id).first();
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        { id },
        duration
      );

      return result || null;
    } catch (error) {
      this.logger.error(`Error finding ${this.tableName} by ID`, { id }, error as Error);
      throw error;
    }
  }

  /**
   * Busca um registro com filtros
   */
  async findOne(filters: Partial<T>, options?: RepositoryOptions): Promise<T | null> {
    try {
      this.logger.debug(`Finding one ${this.tableName}`, { filters });

      const startTime = Date.now();
      let query = this.buildBaseQuery(options);
      query = this.applyFilters(query, filters);
      const result = await query.first();
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `SELECT * FROM ${this.tableName} WHERE ...`,
        { filters },
        duration
      );

      return result || null;
    } catch (error) {
      this.logger.error(`Error finding one ${this.tableName}`, { filters }, error as Error);
      throw error;
    }
  }

  /**
   * Cria um novo registro
   */
  async create(data: Partial<T>, options?: RepositoryOptions): Promise<T> {
    try {
      this.logger.debug(`Creating ${this.tableName}`, { data });

      const startTime = Date.now();
      const query = options?.transaction ? 
        options.transaction(this.tableName) : 
        this.db(this.tableName);
      
      const preparedData = this.prepareDataForInsert(data);
      const [result] = await query.insert(preparedData).returning('*');
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `INSERT INTO ${this.tableName}`,
        { data: preparedData },
        duration
      );

      this.logger.info(`Created ${this.tableName}`, { id: (result as any).id });

      return result;
    } catch (error) {
      this.logger.error(`Error creating ${this.tableName}`, { data }, error as Error);
      throw error;
    }
  }

  /**
   * Atualiza um registro
   */
  async update(id: string, data: Partial<T>, options?: RepositoryOptions): Promise<T | null> {
    try {
      this.logger.debug(`Updating ${this.tableName}`, { id, data });

      const startTime = Date.now();
      const query = options?.transaction ? 
        options.transaction(this.tableName) : 
        this.db(this.tableName);
      
      const preparedData = this.prepareDataForUpdate(data);
      const [result] = await query
        .where('id', id)
        .update(preparedData)
        .returning('*');
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `UPDATE ${this.tableName} SET ... WHERE id = ?`,
        { id, data: preparedData },
        duration
      );

      if (result) {
        this.logger.info(`Updated ${this.tableName}`, { id });
      }

      return result || null;
    } catch (error) {
      this.logger.error(`Error updating ${this.tableName}`, { id, data }, error as Error);
      throw error;
    }
  }

  /**
   * Remove um registro
   */
  async delete(id: string, options?: RepositoryOptions): Promise<boolean> {
    try {
      this.logger.debug(`Deleting ${this.tableName}`, { id });

      const startTime = Date.now();
      const query = options?.transaction ? 
        options.transaction(this.tableName) : 
        this.db(this.tableName);
      
      const deletedRows = await query.where('id', id).del();
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        { id },
        duration
      );

      const success = deletedRows > 0;
      if (success) {
        this.logger.info(`Deleted ${this.tableName}`, { id });
      }

      return success;
    } catch (error) {
      this.logger.error(`Error deleting ${this.tableName}`, { id }, error as Error);
      throw error;
    }
  }

  /**
   * Conta registros com filtros
   */
  async count(filters?: Partial<T>, options?: RepositoryOptions): Promise<number> {
    try {
      this.logger.debug(`Counting ${this.tableName}`, { filters });

      const startTime = Date.now();
      let query = this.buildBaseQuery(options);

      if (filters) {
        query = this.applyFilters(query, filters);
      }

      const result = await query.count('* as count').first();
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `SELECT COUNT(*) FROM ${this.tableName}`,
        { filters },
        duration
      );

      return parseInt(result?.count as string) || 0;
    } catch (error) {
      this.logger.error(`Error counting ${this.tableName}`, { filters }, error as Error);
      throw error;
    }
  }

  /**
   * Verifica se existe um registro com os filtros
   */
  async exists(filters: Partial<T>, options?: RepositoryOptions): Promise<boolean> {
    try {
      const count = await this.count(filters, options);
      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking existence in ${this.tableName}`, { filters }, error as Error);
      throw error;
    }
  }

  /**
   * Busca registros com paginação e retorna metadados
   */
  async findWithPagination(
    filters?: Partial<T>,
    pagination?: PaginationParams,
    options?: RepositoryOptions
  ): Promise<{ items: T[]; total: number; pagination: any }> {
    try {
      const [items, total] = await Promise.all([
        this.findAll(filters, pagination, options),
        this.count(filters, options)
      ]);

      const paginationResult = {
        page: pagination?.page || 1,
        limit: pagination?.limit || 10,
        total,
        totalPages: Math.ceil(total / (pagination?.limit || 10)),
        hasNext: (pagination?.page || 1) * (pagination?.limit || 10) < total,
        hasPrev: (pagination?.page || 1) > 1
      };

      return { items, total, pagination: paginationResult };
    } catch (error) {
      this.logger.error(`Error finding with pagination ${this.tableName}`, { filters, pagination }, error as Error);
      throw error;
    }
  }

  /**
   * Operação em lote - criar múltiplos registros
   */
  async createMany(dataArray: Partial<T>[], options?: RepositoryOptions): Promise<T[]> {
    try {
      this.logger.debug(`Creating many ${this.tableName}`, { count: dataArray.length });

      const startTime = Date.now();
      const query = options?.transaction ? 
        options.transaction(this.tableName) : 
        this.db(this.tableName);
      
      const preparedData = dataArray.map(data => this.prepareDataForInsert(data));
      const results = await query.insert(preparedData).returning('*');
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `INSERT INTO ${this.tableName} (batch)`,
        { count: dataArray.length },
        duration
      );

      this.logger.info(`Created many ${this.tableName}`, { count: results.length });

      return results;
    } catch (error) {
      this.logger.error(`Error creating many ${this.tableName}`, { count: dataArray.length }, error as Error);
      throw error;
    }
  }

  /**
   * Busca com joins personalizados
   */
  async findWithJoins(
    joins: Array<{ table: string; on: string; type?: 'inner' | 'left' | 'right' }>,
    filters?: Partial<T>,
    pagination?: PaginationParams,
    options?: RepositoryOptions
  ): Promise<any[]> {
    try {
      this.logger.debug(`Finding ${this.tableName} with joins`, { joins, filters, pagination });

      let query = this.buildBaseQuery(options);

      // Aplicar joins
      joins.forEach(join => {
        if (join.type === 'inner') {
          query = query.innerJoin(join.table, this.db.raw(join.on));
        } else if (join.type === 'right') {
          query = query.rightJoin(join.table, this.db.raw(join.on));
        } else {
          query = query.leftJoin(join.table, this.db.raw(join.on));
        }
      });

      if (filters) {
        query = this.applyFilters(query, filters);
      }

      if (pagination) {
        query = this.applyPagination(query, pagination);
      }

      const startTime = Date.now();
      const results = await query.select('*');
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `SELECT * FROM ${this.tableName} WITH JOINS`,
        { joins, filters, pagination },
        duration
      );

      return results;
    } catch (error) {
      this.logger.error(`Error finding with joins ${this.tableName}`, { joins, filters }, error as Error);
      throw error;
    }
  }

  /**
   * Executa uma transação
   */
  protected async executeTransaction<R>(callback: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    try {
      this.logger.debug(`Starting transaction for ${this.tableName}`);
      
      const startTime = Date.now();
      const result = await this.db.transaction(callback);
      const duration = Date.now() - startTime;

      this.logger.info(`Transaction completed for ${this.tableName}`, { duration });
      
      return result;
    } catch (error) {
      this.logger.error(`Transaction failed for ${this.tableName}`, {}, error as Error);
      throw error;
    }
  }

  // Métodos auxiliares protegidos
  protected buildBaseQuery(options?: RepositoryOptions): Knex.QueryBuilder {
    let query = this.db(this.tableName);

    if (options?.include?.length) {
      // Implementar lógica de include se necessário
    }

    return query;
  }

  protected applyFilters(query: Knex.QueryBuilder, filters: Partial<T>): Knex.QueryBuilder {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.where(key, value);
      }
    });
    return query;
  }

  protected applyPagination(query: Knex.QueryBuilder, pagination: PaginationParams): Knex.QueryBuilder {
    return query.limit(pagination.limit).offset(pagination.offset);
  }

  protected prepareDataForInsert(data: Partial<T>): any {
    return {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  protected prepareDataForUpdate(data: Partial<T>): any {
    return {
      ...data,
      updated_at: new Date()
    };
  }

  // Métodos de busca avançada
  async search(
    searchTerm: string,
    searchFields: string[],
    filters?: Partial<T>,
    pagination?: PaginationParams,
    options?: RepositoryOptions
  ): Promise<T[]> {
    try {
      this.logger.debug(`Searching ${this.tableName}`, { searchTerm, searchFields, filters });

      let query = this.buildBaseQuery(options);

      // Aplicar busca
      query = query.where(builder => {
        searchFields.forEach((field, index) => {
          if (index === 0) {
            builder.where(field, 'ilike', `%${searchTerm}%`);
          } else {
            builder.orWhere(field, 'ilike', `%${searchTerm}%`);
          }
        });
      });

      if (filters) {
        query = this.applyFilters(query, filters);
      }

      if (pagination) {
        query = this.applyPagination(query, pagination);
      }

      const startTime = Date.now();
      const results = await query.select('*');
      const duration = Date.now() - startTime;

      this.logger.databaseQuery(
        `SEARCH in ${this.tableName}`,
        { searchTerm, searchFields, filters },
        duration
      );

      return results;
    } catch (error) {
      this.logger.error(`Error searching ${this.tableName}`, { searchTerm, searchFields }, error as Error);
      throw error;
    }
  }
}