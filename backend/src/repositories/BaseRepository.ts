import { Knex } from 'knex';
import db from '../config/database';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Interface para os métodos comuns entre repositórios
export interface IRepository<T> {
  findAll(options?: any): Promise<any>;
  findById(id: string | number): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string | number, data: Partial<T>): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}

export abstract class BaseRepository<T extends { id: string | number }> implements IRepository<T> {
  protected db: Knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  // Método findAll padrão
  async findAll(filters?: Partial<T>, pagination?: { page: number; limit: number }): Promise<T[]> {
    let query = this.db(this.tableName).select('*');

    if (filters) {
      query = query.where(filters);
    }

    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.limit(pagination.limit).offset(offset);
    }

    return query;
  }

  // Método findAllWithSearch para uso em repositórios específicos
  async findAllWithSearch(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10 } = options;
    
    const data = await this.findAll({} as Partial<T>, { page, limit });
    const total = await this.count({} as Partial<T>);
    
    return {
      data,
      total,
      page,
      limit
    };
  }

  async findById(id: string | number): Promise<T | null> {
    const result = await this.db(this.tableName)
      .where('id', id)
      .first();
    return result || null;
  }

  async findOne(filters: Partial<T>): Promise<T | null> {
    const result = await this.db(this.tableName)
      .where(filters)
      .first();
    return result || null;
  }

  async create(data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T> {
    const [result] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    return result;
  }

  async update(id: string | number, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T | null> {
    const [result] = await this.db(this.tableName)
      .where('id', id)
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return result || null;
  }

  async delete(id: string | number): Promise<boolean> {
    const deletedRows = await this.db(this.tableName)
      .where('id', id)
      .del();
    return deletedRows > 0;
  }

  async count(filters?: Partial<T>): Promise<number> {
    let query = this.db(this.tableName);

    if (filters) {
      query = query.where(filters);
    }

    const result = await query.count('* as count').first();
    return parseInt(result?.count as string, 10) || 0;
  }

  async exists(filters: Partial<T>): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }

  protected async executeTransaction<R>(callback: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.db.transaction(callback);
  }
}