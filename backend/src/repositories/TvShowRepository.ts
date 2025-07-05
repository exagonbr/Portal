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
    super('tv_shows'); // Usando a tabela tv_shows (plural)
  }

  // Mapear dados da tabela tv_shows para o formato esperado pela API
  private mapToResponseDto(tvShow: any): TvShowResponseDto {
    return {
      id: tvShow.id?.toString() || '',
      version: tvShow.version || 1,
      api_id: tvShow.api_id || undefined,
      backdrop_image_id: tvShow.backdrop_image_id || undefined,
      backdrop_path: tvShow.poster_url || undefined, // Usando poster_url como backdrop
      contract_term_end: tvShow.last_air_date || new Date().toISOString(),
      date_created: tvShow.created_at || new Date().toISOString(),
      deleted: !tvShow.is_active || false,
      first_air_date: tvShow.first_air_date || new Date().toISOString(),
      imdb_id: tvShow.imdb_id || undefined,
      last_updated: tvShow.updated_at || new Date().toISOString(),
      manual_input: false,
      manual_support_id: tvShow.manual_support_id || undefined,
      manual_support_path: tvShow.manual_support_path || undefined,
      name: tvShow.title || tvShow.name || '',
      original_language: 'pt-BR',
      overview: tvShow.description || '',
      popularity: tvShow.view_count || 0,
      poster_image_id: tvShow.poster_image_id || undefined,
      poster_path: tvShow.poster_url || undefined,
      producer: 'Sabercon', // Valor padrão
      vote_average: tvShow.rating || 0,
      vote_count: tvShow.view_count || 0,
      total_load: tvShow.episodes ? `${Math.floor(tvShow.episodes * 25 / 60)}h ${(tvShow.episodes * 25) % 60}m` : undefined,
      created_at: tvShow.created_at || new Date().toISOString(),
      updated_at: tvShow.updated_at || new Date().toISOString()
    };
  }

  async findWithFilters(filters: TvShowFilters): Promise<TvShowListResult> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'title',
      sortOrder = 'asc',
      search,
      ...otherFilters
    } = filters;

    try {
      const query = this.db(this.tableName)
        .select('*')
        .where('is_active', true)
        .timeout(20000); // 20 segundos timeout
      
      const countQuery = this.db(this.tableName)
        .count('* as total')
        .where('is_active', true)
        .timeout(20000) // 20 segundos timeout
        .first();

      if (search) {
        query.where(builder => {
          builder
            .where('title', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`);
        });
        countQuery.where(builder => {
          builder
            .where('title', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`);
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
      const mappedItems = items.map(item => this.mapToResponseDto(item));

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
    } catch (error) {
      console.error('Erro na query de TV Shows:', error);
      
      // Se for timeout, retornar resultado vazio em vez de erro
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn('Timeout na query de TV Shows, retornando resultado vazio');
        return {
          items: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }
      
      throw error;
    }
  }

  async findByIdForApi(id: string): Promise<TvShowResponseDto | null> {
    try {
      const tvShow = await this.db(this.tableName)
        .select('*')
        .where('id', id)
        .where('is_active', true)
        .timeout(20000) // 20 segundos timeout
        .first();

      if (!tvShow) {
        return null;
      }

      return this.mapToResponseDto(tvShow);
    } catch (error) {
      console.error('Erro na query de TV Show por ID:', error);
      
      // Se for timeout, retornar null em vez de erro
      if (error instanceof Error && error.message.includes('timeout')) {
        console.warn('Timeout na query de TV Show por ID, retornando null');
        return null;
      }
      
      throw error;
    }
  }
}