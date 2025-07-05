import { BaseRepository } from './BaseRepository';
import { TvShow } from '../entities/TVShow';
import { TvShowResponseDto } from '../dto/TvShowDto';

export interface TvShowFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TvShowListResult {
  items: TvShowResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class TvShowRepository extends BaseRepository<TvShow> {
  constructor() {
    super('tv_show');
  }

  async findByName(name: string, defaultValue: any = null): Promise<any> {
    const tvShow = await this.findByName(name);
    if (tvShow && tvShow.name) {
        try {
            // Tenta fazer o parse do JSON, se falhar, retorna o valor como string
            return JSON.parse(tvShow.name);
        } catch (e) {
            return tvShow.name;
        }
    }
    return defaultValue;
  }

  async findWithFilters(filters: TvShowFilters): Promise<TvShowListResult> {
  const {
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    search,
    ...otherFilters
  } = filters;

  const query = this.db(this.tableName).select('*');
  const countQuery = this.db(this.tableName).count('* as total').first();

  if (search) {
    query.where(builder => {
      builder
        .where('name', 'ilike', `%${search}%`)
        .orWhere('institutionName', 'ilike', `%${search}%`);
    });
    countQuery.where(builder => {
      builder
        .where('name', 'ilike', `%${search}%`)
        .orWhere('institutionName', 'ilike', `%${search}%`);
    });
  }

  if (Object.keys(otherFilters).length > 0) {
      query.where(otherFilters);
      countQuery.where(otherFilters);
  }
  
  query.orderBy(sortBy, sortOrder).limit(limit).offset((page - 1) * limit);

  const [items, totalResult] = await Promise.all([query, countQuery]);
  
  const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;
  const totalPages = Math.ceil(total / limit);


  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
    
}
}