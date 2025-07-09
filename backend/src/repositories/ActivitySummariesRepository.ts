import { DeleteResult } from 'typeorm';
import { BaseRepository, PaginatedResult } from './BaseRepository';
import { ActivitySummaries } from '../entities/ActivitySummaries';
import { Knex } from 'knex';

export class ActivitySummariesRepository extends BaseRepository<ActivitySummaries> {
  constructor() {
    super("activity_summaries");
  }

  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<ActivitySummaries>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      let query = this.db(this.tableName).select("*");

      if (search) {
        query = query.whereILike("title", `%${search}%`)
          .orWhereILike("description", `%${search}%`);
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
            qb.whereILike("title", `%${search}%`)
              .orWhereILike("description", `%${search}%`);
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

  async findAllWithSearch(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ data: ActivitySummaries[]; total: number; page: number; limit: number }> {
    return this.findAllPaginated(options);
  }

  async findOne(filters: Partial<ActivitySummaries>): Promise<ActivitySummaries | null> {
    try {
      const result = await this.db(this.tableName)
        .where(filters)
        .first();
      return result || null;
    } catch (error) {
      console.error('Error in findOne:', error);
      throw error;
    }
  }

  async findByActivityId(activityId: number): Promise<ActivitySummaries[]> {
    try {
      return await this.db(this.tableName)
        .where({ activity_id: activityId })
        .orderBy('created_at', 'DESC');
    } catch (error) {
      console.error('Error in findByActivityId:', error);
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<ActivitySummaries[]> {
    try {
      return await this.db(this.tableName)
        .where({ user_id: userId })
        .orderBy('created_at', 'DESC');
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw error;
    }
  }

  async findByUserAndActivity(userId: number, activityId: number): Promise<ActivitySummaries | null> {
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
