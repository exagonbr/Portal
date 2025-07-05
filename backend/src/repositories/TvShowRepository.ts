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
    super('tv_show'); // Corrigido: usar tv_show (singular)
  }

  // Mapear dados da tabela tv_show para o formato esperado pela API
  private mapToResponseDto(tvShow: any): TvShowResponseDto {
    return {
      id: tvShow.id?.toString() || '',
      version: tvShow.version || 1,
      api_id: tvShow.api_id || undefined,
      backdrop_image_id: tvShow.backdrop_image_id?.toString() || undefined,
      backdrop_path: tvShow.backdrop_path || undefined,
      contract_term_end: tvShow.contract_term_end || new Date().toISOString(),
      date_created: tvShow.date_created || new Date().toISOString(),
      deleted: tvShow.deleted || false,
      first_air_date: tvShow.first_air_date || new Date().toISOString(),
      imdb_id: tvShow.imdb_id || undefined,
      last_updated: tvShow.last_updated || new Date().toISOString(),
      manual_input: tvShow.manual_input || false,
      manual_support_id: tvShow.manual_support_id?.toString() || undefined,
      manual_support_path: tvShow.manual_support_path || undefined,
      name: tvShow.name || '',
      original_language: tvShow.original_language || 'pt-BR',
      overview: tvShow.overview || '',
      popularity: tvShow.popularity || 0,
      poster_image_id: tvShow.poster_image_id?.toString() || undefined,
      poster_path: tvShow.poster_path || undefined,
      producer: tvShow.producer || 'SABERCON EDUCATIVA',
      vote_average: tvShow.vote_average || 0,
      vote_count: tvShow.vote_count || 0,
      total_load: tvShow.total_load || undefined,
      created_at: tvShow.date_created || new Date().toISOString(),
      updated_at: tvShow.last_updated || new Date().toISOString()
    };
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

    try {
      // Garantir que nunca use 'title' - sempre usar 'name'
      const safeSortBy = sortBy === 'title' ? 'name' : (sortBy || 'name');

      // Corrigido: usar campos que realmente existem na tabela
      const query = this.db(this.tableName)
        .select('*')
        .where(function() {
          this.whereNull('deleted').orWhere('deleted', false);
        })
        .timeout(20000); // 20 segundos timeout
      
      const countQuery = this.db(this.tableName)
        .count('* as total')
        .where(function() {
          this.whereNull('deleted').orWhere('deleted', false);
        })
        .timeout(20000) // 20 segundos timeout
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
      
      query.orderBy(safeSortBy, sortOrder).limit(limit).offset((page - 1) * limit);

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
        .where(function() {
          this.whereNull('deleted').orWhere('deleted', false);
        })
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

  async toggleStatus(id: string): Promise<TvShow | null> {
    try {
      const tvShow = await this.findById(id);
      if (!tvShow) {
        return null;
      }

      const newDeletedStatus = !tvShow.deleted;
      await this.db(this.tableName)
        .where('id', id)
        .update({
          deleted: newDeletedStatus,
          last_updated: new Date()
        });

      return await this.findById(id);
    } catch (error) {
      console.error('Erro ao alternar status do TV Show:', error);
      throw error;
    }
  }
}