import { BaseRepository } from '../repositories/BaseRepository';
import { TvShowResponseDto } from '../dto/TvShowDto';

export interface CollectionFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CollectionListResult {
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

class CollectionRepository extends BaseRepository<any> {
  constructor() {
    super('tv_show');
  }

  // Mapear dados da tabela tv_show para o formato esperado pela API de collections
  private mapToCollectionDto(tvShow: any): TvShowResponseDto {
    return {
      id: tvShow.id?.toString() || '',
      version: tvShow.version || 1,
      api_id: tvShow.api_id || undefined,
      backdrop_image_id: tvShow.backdrop_image_id || undefined,
      backdrop_path: tvShow.backdrop_path || undefined,
      contract_term_end: tvShow.contract_term_end || new Date().toISOString(),
      date_created: tvShow.date_created || new Date().toISOString(),
      deleted: tvShow.deleted || false,
      first_air_date: tvShow.first_air_date || new Date().toISOString(),
      imdb_id: tvShow.imdb_id || undefined,
      last_updated: tvShow.last_updated || new Date().toISOString(),
      manual_input: tvShow.manual_input || false,
      manual_support_id: tvShow.manual_support_id || undefined,
      manual_support_path: tvShow.manual_support_path || undefined,
      name: tvShow.name || '',
      original_language: tvShow.original_language || 'pt-BR',
      overview: tvShow.overview || '',
      popularity: tvShow.popularity || 0,
      poster_image_id: tvShow.poster_image_id || undefined,
      poster_path: tvShow.poster_path || undefined,
      producer: tvShow.producer || 'Sabercon',
      vote_average: tvShow.vote_average || 0,
      vote_count: tvShow.vote_count || 0,
      total_load: tvShow.total_load || undefined,
      created_at: tvShow.date_created || new Date().toISOString(),
      updated_at: tvShow.last_updated || new Date().toISOString()
    };
  }

  async findWithFilters(filters: CollectionFilters): Promise<CollectionListResult> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      ...otherFilters
    } = filters;

    const query = this.db('tv_show')
      .select('*')
      .where('deleted', false); // Apenas shows não deletados
    
    const countQuery = this.db('tv_show')
      .count('* as total')
      .where('deleted', false)
      .first();

    if (search) {
      query.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('overview', 'ilike', `%${search}%`)
          .orWhere('producer', 'ilike', `%${search}%`);
      });
      countQuery.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('overview', 'ilike', `%${search}%`)
          .orWhere('producer', 'ilike', `%${search}%`);
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

    // Mapear os dados para o formato esperado
    const mappedItems = items.map(item => this.mapToCollectionDto(item));

    return {
      items: mappedItems,
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

  async findByIdForApi(id: string): Promise<TvShowResponseDto | null> {
    const tvShow = await this.db('tv_show')
      .select('*')
      .where('id', id)
      .where('deleted', false)
      .first();

    if (!tvShow) {
      return null;
    }

    return this.mapToCollectionDto(tvShow);
  }

  async findPopular(limit: number = 10): Promise<TvShowResponseDto[]> {
    const items = await this.db('tv_show')
      .select('*')
      .where('deleted', false)
      .orderBy('popularity', 'desc')
      .limit(limit);

    return items.map(item => this.mapToCollectionDto(item));
  }

  async findTopRated(limit: number = 10): Promise<TvShowResponseDto[]> {
    const items = await this.db('tv_show')
      .select('*')
      .where('deleted', false)
      .orderBy('vote_average', 'desc')
      .limit(limit);

    return items.map(item => this.mapToCollectionDto(item));
  }

  async findRecent(limit: number = 10): Promise<TvShowResponseDto[]> {
    const items = await this.db('tv_show')
      .select('*')
      .where('deleted', false)
      .orderBy('first_air_date', 'desc')
      .limit(limit);

    return items.map(item => this.mapToCollectionDto(item));
  }
}

export class CollectionService {
  createCollection(body: any) {
    return this.repository.create(body);
  }
  updateCollection(id: string, body: any) {
    return this.repository.update(id, body);
  }
  deleteCollection(id: string) {
    return this.repository.delete(id);
  }
  private repository: CollectionRepository;

  constructor() {
    this.repository = new CollectionRepository();
  }

  async getAllCollections(filters: CollectionFilters): Promise<CollectionListResult> {
    return this.repository.findWithFilters(filters);
  }

  async getCollectionById(id: string): Promise<TvShowResponseDto | null> {
    return this.repository.findByIdForApi(id);
  }

  async searchCollections(searchTerm: string, filters: CollectionFilters): Promise<CollectionListResult> {
    return this.getAllCollections({
      ...filters,
      search: searchTerm
    });
  }

  async getPopularCollections(limit: number = 10): Promise<TvShowResponseDto[]> {
    return this.repository.findPopular(limit);
  }

  async getTopRatedCollections(limit: number = 10): Promise<TvShowResponseDto[]> {
    return this.repository.findTopRated(limit);
  }

  async getRecentCollections(limit: number = 10): Promise<TvShowResponseDto[]> {
    return this.repository.findRecent(limit);
  }
} 