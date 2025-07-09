import knex from '../database/connection';

export abstract class BaseRepository<T> {
  protected db: typeof knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = knex;
    this.tableName = tableName;
  }

  async findAll(): Promise<T[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .orderBy('created_at', 'desc');
  }

  async findById(id: string): Promise<T | null> {
    const result = await this.db(this.tableName)
      .where({ id })
      .first();
    
    return result || null;
  }

  async create(data: any): Promise<T> {
    const [result] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    
    return result;
  }

  async update(id: string, data: any): Promise<T | null> {
    const [result] = await this.db(this.tableName)
      .where({ id })
      .update(data)
      .returning('*');
    
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const count = await this.db(this.tableName)
      .where({ id })
      .delete();
    
    return count > 0;
  }
} 