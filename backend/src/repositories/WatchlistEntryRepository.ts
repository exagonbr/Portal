import { Repository, DeleteResult } from 'typeorm';
import { AppDataSource } from "../config/typeorm.config";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { WatchlistEntry } from '../entities/WatchlistEntry';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';

export class WatchlistEntryRepository extends ExtendedRepository<WatchlistEntry> {
  private repository: Repository<WatchlistEntry>;
  constructor() {
    super("watchlistentrys");
    this.repository = AppDataSource.getRepository(WatchlistEntry);
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

  async findActive(limit: number = 100): Promise<any[]> {
    return this.find({
      where: { deleted: false },
      take: limit,
      order: { id: 'DESC' }
    });
  }

  async findByIdActive(id: string | number): Promise<any | null> {
    return this.findOne({
      where: { id: id as any, deleted: false }
    });
  }

  async findWithPagination(page: number = 1, limit: number = 10): Promise<{ data: any[], total: number }> {
    const [data, total] = await this.findAndCount({
      where: { deleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' }
    });
    return { data, total };
  }

  async searchByName(name: string): Promise<any[]> {
    return this.createQueryBuilder()
      .where("LOWER(name) LIKE LOWER(:name)", { name: `%${name}%` })
      .andWhere("deleted = :deleted", { deleted: false })
      .getMany();
  }

  async softDelete(id: string | number): Promise<void> {
    await this.update(id as any, { deleted: true });
  }


  async save(entity: any): Promise<any> {
    return await this.manager.save(entity);
  }

}
