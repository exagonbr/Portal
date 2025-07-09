import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { WatchlistEntry } from '../entities/WatchlistEntry';
import { BaseRepository } from './BaseRepository';

export class WatchlistEntryRepository extends ExtendedRepository<WatchlistEntry> {
  constructor() {
    super("watchlist_entries");
  }

  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<WatchlistEntry>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      let query = this.db(this.tableName).select("*");

      if (search) {
        query = query.where(function() {
          this.whereILike("name", `%${search}%`)
              .orWhereILike("description", `%${search}%`);
        });
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
            qb.where(function() {
              this.whereILike("name", `%${search}%`)
                  .orWhereILike("description", `%${search}%`);
            });
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
      console.error(`Error fetching watchlist entries:`, error);
      throw error;
    }
  }

  // Implementing required methods from BaseRepository
  async findAll(filters?: Partial<WatchlistEntry>): Promise<WatchlistEntry[]> {
    return super.findAll(filters);
  }

  async findById(id: string | number): Promise<WatchlistEntry | null> {
    return super.findById(id);
  }

  async create(data: Partial<WatchlistEntry>): Promise<WatchlistEntry> {
    return super.create(data);
  }

  async update(id: string | number, data: Partial<WatchlistEntry>): Promise<WatchlistEntry | null> {
    return super.update(id, data);
  }

  async delete(id: string | number): Promise<boolean> {
    return super.delete(id);
  }
}
