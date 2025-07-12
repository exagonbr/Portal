import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { SecurityPolicies } from '../entities/SecurityPolicies';

export class SecurityPoliciesRepository extends ExtendedRepository<SecurityPolicies> {
  constructor() {
    super("security_policies");
  }

  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<SecurityPolicies>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      let query = this.db(this.tableName).select("*");

      if (search) {
        query = query.whereILike("name", `%${search}%`)
          .orWhereILike("description", `%${search}%`);
      }

      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("id", "DESC")
        .limit(limit)
        .offset(offset);

      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify(qb => {
          if (search) {
            qb.whereILike("name", `%${search}%`)
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

  async searchByName(name: string): Promise<SecurityPolicies[]> {
    try {
      const result = await this.db(this.tableName)
        .select("*")
        .whereILike("name", `%${name}%`)
        .orWhereILike("description", `%${name}%`)
        .orderBy("name", "ASC");

      return result;
    } catch (error) {
      console.error('Error in searchByName:', error);
      throw error;
    }
  }
}
