import { Knex } from 'knex';
import db from '../config/database';

export abstract class BaseRepository<T> {
  protected db: Knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  async findAll(filters?: Partial<T>, pagination?: { page: number; limit: number }): Promise<T[]> {
    let query = this.db(this.tableName);

    if (filters) {
      query = query.where(filters);
    }

    if (pagination) {
      const offset = (pagination.page - 1) * pagination.limit;
      query = query.limit(pagination.limit).offset(offset);
    }

    return query.select('*');
  }

  async findById(id: string): Promise<T | null> {
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

  async create(data: Partial<T>): Promise<T> {
    const [result] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    return result;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const [result] = await this.db(this.tableName)
      .where('id', id)
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
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
    return parseInt(result?.count as string) || 0;
  }

  async exists(filters: Partial<T>): Promise<boolean> {
    const count = await this.count(filters);
    return count > 0;
  }

  protected async executeTransaction<R>(callback: (trx: Knex.Transaction) => Promise<R>): Promise<R> {
    return this.db.transaction(callback);
  }
}
