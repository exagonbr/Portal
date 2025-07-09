import { DeleteResult } from 'typeorm';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { ActivitySessions } from '../entities/ActivitySessions';
import { Knex } from 'knex';

export class ActivitySessionsRepository extends ExtendedRepository<ActivitySessions> {
  constructor() {
    super("activity_sessions");
  }

  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<ActivitySessions>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      let query = this.db(this.tableName).select("*");

      if (search) {
        query = query.whereILike("activity_id", `%${search}%`)
          .orWhereILike("user_id", `%${search}%`);
      }

      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("id", "DESC")
        .limit(limit)
        .offset(offset);

      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify((qb: Knex.QueryBuilder) => {
          if (search) {
            qb.whereILike("activity_id", `%${search}%`)
              .orWhereILike("user_id", `%${search}%`);
          }
        })
        .first();

      const total = parseInt(countResult?.total as string, 10) || 0;

      return {
        data,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error in findAllPaginated:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<ActivitySessions | null> {
    try {
      const result = await this.db(this.tableName)
        .where({ id })
        .first();
      return result || null;
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  async create(data: Partial<ActivitySessions>): Promise<ActivitySessions> {
    try {
      const [id] = await this.db(this.tableName)
        .insert(data)
        .returning('id');

      const created = await this.findById(id);
      if (!created) {
        throw new Error('Failed to create activity session');
      }
      return created;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<ActivitySessions>): Promise<ActivitySessions | null> {
    try {
      const updated = await this.db(this.tableName)
        .where({ id })
        .update(data)
        .returning('*');
      return updated[0] || null;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db(this.tableName)
        .where({ id })
        .delete();
      return result > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }

  async findByActivityId(activityId: number): Promise<ActivitySessions[]> {
    try {
      return await this.db(this.tableName)
        .where({ activity_id: activityId })
        .orderBy('created_at', 'DESC');
    } catch (error) {
      console.error('Error in findByActivityId:', error);
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<ActivitySessions[]> {
    try {
      return await this.db(this.tableName)
        .where({ user_id: userId })
        .orderBy('created_at', 'DESC');
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw error;
    }
  }

  async findByUserAndActivity(userId: number, activityId: number): Promise<ActivitySessions | null> {
    try {
      const result = await this.db(this.tableName)
        .where({
          user_id: userId,
          activity_id: activityId
        })
        .first();
      return result || null;
    } catch (error) {
      console.error('Error in findByUserAndActivity:', error);
      throw error;
    }
  }
}
