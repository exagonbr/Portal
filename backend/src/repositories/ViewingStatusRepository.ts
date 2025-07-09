import { DeleteResult } from 'typeorm';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { ViewingStatus } from '../entities/ViewingStatus';
import { Knex } from 'knex';

export class ViewingStatusRepository extends ExtendedRepository<ViewingStatus> {
  constructor() {
    super("viewingstatus");
  }

  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<ViewingStatus>> {
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

  async findById(id: number): Promise<ViewingStatus | null> {
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

  async create(data: Partial<ViewingStatus>): Promise<ViewingStatus> {
    try {
      const [id] = await this.db(this.tableName)
        .insert(data)
        .returning('id');

      const created = await this.findById(id);
      if (!created) {
        throw new Error('Failed to create viewing status');
      }
      return created;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<ViewingStatus>): Promise<ViewingStatus | null> {
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

  async findByUserId(userId: number): Promise<ViewingStatus[]> {
    try {
      return await this.db(this.tableName)
        .where({ user_id: userId })
        .orderBy('last_watched_at', 'DESC');
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw error;
    }
  }

  async findByVideoId(videoId: number): Promise<ViewingStatus[]> {
    try {
      return await this.db(this.tableName)
        .where({ video_id: videoId })
        .orderBy('last_watched_at', 'DESC');
    } catch (error) {
      console.error('Error in findByVideoId:', error);
      throw error;
    }
  }

  async findByUserAndVideo(userId: number, videoId: number): Promise<ViewingStatus | null> {
    try {
      const result = await this.db(this.tableName)
        .where({
          user_id: userId,
          video_id: videoId
        })
        .first();
      return result || null;
    } catch (error) {
      console.error('Error in findByUserAndVideo:', error);
      throw error;
    }
  }
}
