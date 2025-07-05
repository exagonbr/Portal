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

  // Função para limpar e normalizar extensões de arquivo
  private cleanExtension(extension: string | null | undefined): string {
    if (!extension) return '';
    
    // Remover ponto inicial se existir
    const cleanExt = extension.startsWith('.') ? extension.slice(1) : extension;
    
    // Normalizar extensões comuns
    const normalizedExt = cleanExt.toLowerCase();
    
    // Mapear extensões conhecidas
    const extensionMap: Record<string, string> = {
      'jpeg': 'jpg',
      'png': 'png',
      'gif': 'gif',
      'webp': 'webp',
      'svg': 'svg',
      'bmp': 'bmp',
      'tiff': 'tiff',
      'ico': 'ico'
    };
    
    return extensionMap[normalizedExt] || normalizedExt;
  }

  // Mapear dados da tabela tv_show para o formato esperado pela API
  private mapToResponseDto(tvShow: any): TvShowResponseDto {
    // Construir URLs das imagens se temos os dados necessários
    let posterImageUrl = tvShow.poster_path;
    let backdropImageUrl = tvShow.backdrop_path;
    
    // Se temos sha256hex das imagens, construir URLs do CloudFront
    if (tvShow.poster_sha256hex) {
      const extension = this.cleanExtension(tvShow.poster_extension);
      const extensionSuffix = extension ? `.${extension}` : '';
      posterImageUrl = `https://d26a2wm7tuz2gu.cloudfront.net/upload/${tvShow.poster_sha256hex}${extensionSuffix}`;
    }
    
    if (tvShow.backdrop_sha256hex) {
      const extension = this.cleanExtension(tvShow.backdrop_extension);
      const extensionSuffix = extension ? `.${extension}` : '';
      backdropImageUrl = `https://d26a2wm7tuz2gu.cloudfront.net/upload/${tvShow.backdrop_sha256hex}${extensionSuffix}`;
    }

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
      updated_at: tvShow.last_updated || new Date().toISOString(),
      // Campos adicionais para a tela
      poster_image_url: posterImageUrl,
      backdrop_image_url: backdropImageUrl,
      video_count: tvShow.video_count || 0,
      authors: tvShow.authors || 'Sistema Portal'
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
        .select(
          'tv_show.*',
          this.db.raw('COALESCE(video_counts.video_count, 0) as video_count'),
          'poster_file.sha256hex as poster_sha256hex',
          'poster_file.extension as poster_extension',
          'backdrop_file.sha256hex as backdrop_sha256hex',
          'backdrop_file.extension as backdrop_extension',
          // Incluir autores
          this.db.raw(`
            COALESCE(
              STRING_AGG(DISTINCT author.name, ', '), 
              'Sistema Portal'
            ) as authors
          `)
        )
        .leftJoin(
          this.db('video')
            .select('show_id')
            .count('* as video_count')
            .where("deleted", false)
            .groupBy('show_id')
            .as('video_counts'),
          'tv_show.id', 'video_counts.show_id'
        )
        .leftJoin('file as poster_file', 'tv_show.poster_image_id', 'poster_file.id')
        .leftJoin('file as backdrop_file', 'tv_show.backdrop_image_id', 'backdrop_file.id')
        // Join com autores (usando o nome correto da coluna)
        .leftJoin('tv_show_author', 'tv_show.id', 'tv_show_author.tv_show_authors_id')
        .leftJoin('author', 'tv_show_author.author_id', 'author.id')
        .where(function() {
          this.where("tv_show.deleted", false);
        })
        .groupBy(
          'tv_show.id',
          'tv_show.version',
          'tv_show.api_id',
          'tv_show.backdrop_image_id',
          'tv_show.backdrop_path',
          'tv_show.contract_term_end',
          'tv_show.date_created',
          'tv_show.deleted',
          'tv_show.first_air_date',
          'tv_show.imdb_id',
          'tv_show.last_updated',
          'tv_show.manual_input',
          'tv_show.manual_support_id',
          'tv_show.manual_support_path',
          'tv_show.name',
          'tv_show.original_language',
          'tv_show.overview',
          'tv_show.popularity',
          'tv_show.poster_image_id',
          'tv_show.poster_path',
          'tv_show.producer',
          'tv_show.vote_average',
          'tv_show.vote_count',
          'tv_show.total_load',
          'video_counts.video_count',
          'poster_file.sha256hex',
          'poster_file.extension',
          'backdrop_file.sha256hex',
          'backdrop_file.extension'
        )
        .timeout(20000); // 20 segundos timeout
      
      const countQuery = this.db(this.tableName)
        .count('* as total')
        .where(function() {
          this.where("tv_show.deleted", false);
        })
        .timeout(20000) // 20 segundos timeout
        .first();

      if (search) {
        query.where(builder => {
          builder
            .where('tv_show.name', 'ilike', `%${search}%`)
            .orWhere('tv_show.overview', 'ilike', `%${search}%`)
            .orWhere('tv_show.producer', 'ilike', `%${search}%`);
        });
        countQuery.where(builder => {
          builder
            .where('tv_show.name', 'ilike', `%${search}%`)
            .orWhere('tv_show.overview', 'ilike', `%${search}%`)
            .orWhere('tv_show.producer', 'ilike', `%${search}%`);
        });
      }

      if (Object.keys(otherFilters).length > 0) {
        query.where(otherFilters);
        countQuery.where(otherFilters);
      }
      
      query.orderBy(`tv_show.${safeSortBy}`, sortOrder).limit(limit).offset((page - 1) * limit);

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
      // Buscar dados do TV Show com autores
      const tvShow = await this.db(this.tableName)
        .select(
          'tv_show.*',
          this.db.raw('COALESCE(video_counts.video_count, 0) as video_count'),
          'poster_file.sha256hex as poster_sha256hex',
          'poster_file.extension as poster_extension',
          'backdrop_file.sha256hex as backdrop_sha256hex',
          'backdrop_file.extension as backdrop_extension',
          // Incluir autores
          this.db.raw(`
            COALESCE(
              STRING_AGG(DISTINCT author.name, ', '), 
              'Sistema Portal'
            ) as authors
          `)
        )
        .leftJoin(
          this.db('video')
            .select('show_id')
            .count('* as video_count')
            .where("deleted", false)
            .groupBy('show_id')
            .as('video_counts'),
          'tv_show.id', 'video_counts.show_id'
        )
        .leftJoin('file as poster_file', 'tv_show.poster_image_id', 'poster_file.id')
        .leftJoin('file as backdrop_file', 'tv_show.backdrop_image_id', 'backdrop_file.id')
        // Join com autores (usando o nome correto da coluna)
        .leftJoin('tv_show_author', 'tv_show.id', 'tv_show_author.tv_show_authors_id')
        .leftJoin('author', 'tv_show_author.author_id', 'author.id')
        .where('tv_show.id', id)
        .where(function() {
          this.where("tv_show.deleted", false);
        })
        .groupBy(
          'tv_show.id',
          'tv_show.version',
          'tv_show.api_id',
          'tv_show.backdrop_image_id',
          'tv_show.backdrop_path',
          'tv_show.contract_term_end',
          'tv_show.date_created',
          'tv_show.deleted',
          'tv_show.first_air_date',
          'tv_show.imdb_id',
          'tv_show.last_updated',
          'tv_show.manual_input',
          'tv_show.manual_support_id',
          'tv_show.manual_support_path',
          'tv_show.name',
          'tv_show.original_language',
          'tv_show.overview',
          'tv_show.popularity',
          'tv_show.poster_image_id',
          'tv_show.poster_path',
          'tv_show.producer',
          'tv_show.vote_average',
          'tv_show.vote_count',
          'tv_show.total_load',
          'video_counts.video_count',
          'poster_file.sha256hex',
          'poster_file.extension',
          'backdrop_file.sha256hex',
          'backdrop_file.extension'
        )
        .timeout(20000) // 20 segundos timeout
        .first();

      if (!tvShow) {
        return null;
      }

      // Mapear para DTO
      const tvShowDto = this.mapToResponseDto(tvShow);
      
      // Buscar módulos e incluir na resposta
      try {
        const modules = await this.findModulesByTvShowId(id);
        (tvShowDto as any).modules = modules;
      } catch (error) {
        console.warn('Erro ao buscar módulos, continuando sem eles:', error);
        (tvShowDto as any).modules = {};
      }

      return tvShowDto;
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

  // Buscar módulos/vídeos organizados por sessão para um TV Show específico
  async findModulesByTvShowId(tvShowId: string): Promise<Record<string, any[]>> {
    try {
      console.log(`🔍 Buscando vídeos para TV Show ID: ${tvShowId}`);
      
      // Buscar vídeos relacionados ao TV Show
      const videos = await this.db('video as v')
        .leftJoin('video_file as vf', 'v.id', 'vf.video_files_id')
        .leftJoin('file as f', 'vf.file_id', 'f.id')
        .select(
          'v.id',
          'v.title',
          'v.name',
          'v.overview as description',
          'v.duration',
          'v.season_number',
          'v.episode_number',
          'v.still_path as thumbnail_url',
          'f.sha256hex as file_sha256hex',
          'f.extension as file_extension',
          'f.name as file_name',
          'f.content_type as file_mimetype',
          'f.size as file_size'
        )
        .where('v.show_id', tvShowId)
        .where("deleted", false)
        .orderBy('v.season_number')
        .orderBy('v.episode_number')
        .timeout(20000);

      console.log(`✅ Encontrados ${videos.length} vídeos para TV Show ${tvShowId}`);

      // Agrupar vídeos por sessão (season_number)
      const modules: Record<string, any[]> = {};
      
      videos.forEach(video => {
        const sessionNumber = video.season_number || 1;
        const moduleKey = `session_${sessionNumber}`;
        
        if (!modules[moduleKey]) {
          modules[moduleKey] = [];
        }
        
        // Construir URL do CloudFront se temos os dados do arquivo
        let videoUrl = null;
        if (video.file_sha256hex && video.file_extension) {
          const extension = this.cleanExtension(video.file_extension);
          const extensionSuffix = extension ? `.${extension}` : '';
          videoUrl = `https://d26a2wm7tuz2gu.cloudfront.net/upload/${video.file_sha256hex}${extensionSuffix}`;
        }
        
        modules[moduleKey].push({
          id: video.id,
          title: video.title || video.name || 'Vídeo sem título',
          description: video.description || '',
          video_url: videoUrl,
          module_number: sessionNumber,
          episode_number: video.episode_number || 1,
          duration: video.duration || '00:00:00',
          thumbnail_url: video.thumbnail_url,
          file_sha256hex: video.file_sha256hex,
          file_extension: video.file_extension,
          file_name: video.file_name,
          file_mimetype: video.file_mimetype,
          file_size: video.file_size
        });
      });

      console.log(`📊 Módulos organizados: ${Object.keys(modules).length} sessões`);
      
      return modules;
    } catch (error) {
      console.error('Erro ao buscar módulos do TV Show:', error);
      throw error;
    }
  }

  // Buscar todos os vídeos de um TV Show (lista simples)
  async findVideosByTvShowId(tvShowId: string): Promise<any[]> {
    try {
      console.log(`🎬 Buscando lista de vídeos para TV Show ID: ${tvShowId}`);
      
      const videos = await this.db('video as v')
        .leftJoin('video_file as vf', 'v.id', 'vf.video_files_id')
        .leftJoin('file as f', 'vf.file_id', 'f.id')
        .select(
          'v.id',
          'v.title',
          'v.name',
          'v.overview as description',
          'v.duration',
          'v.season_number as session_number',
          'v.episode_number',
          'v.still_path as thumbnail_url',
          'f.sha256hex as file_sha256hex',
          'f.extension as file_extension',
          'f.name as file_name',
          'f.content_type as file_mimetype',
          'f.size as file_size'
        )
        .where('v.show_id', tvShowId)
        .where("deleted", false)
        .orderBy('v.season_number')
        .orderBy('v.episode_number')
        .timeout(20000);

      console.log(`✅ Encontrados ${videos.length} vídeos para TV Show ${tvShowId}`);

      // Mapear vídeos com URLs do CloudFront
      const mappedVideos = videos.map(video => {
        let videoUrl = null;
        if (video.file_sha256hex && video.file_extension) {
          const extension = this.cleanExtension(video.file_extension);
          const extensionSuffix = extension ? `.${extension}` : '';
          videoUrl = `https://d26a2wm7tuz2gu.cloudfront.net/upload/${video.file_sha256hex}${extensionSuffix}`;
        }
        
        return {
          id: video.id,
          title: video.title || video.name || 'Vídeo sem título',
          description: video.description || '',
          video_url: videoUrl,
          session_number: video.session_number || 1,
          episode_number: video.episode_number || 1,
          duration: video.duration || '00:00:00',
          thumbnail_url: video.thumbnail_url,
          file_sha256hex: video.file_sha256hex,
          file_extension: video.file_extension,
          file_name: video.file_name,
          file_mimetype: video.file_mimetype,
          file_size: video.file_size
        };
      });

      return mappedVideos;
    } catch (error) {
      console.error('Erro ao buscar vídeos do TV Show:', error);
      throw error;
    }
  }

  // Buscar estatísticas de um TV Show específico
  async getStatsByTvShowId(tvShowId: string): Promise<any> {
    try {
      console.log(`📊 Calculando estatísticas para TV Show ID: ${tvShowId}`);
      
      // Buscar contagem de vídeos
      const videoCountResult = await this.db('video')
        .count('* as total')
        .where('show_id', tvShowId)
        .where("deleted", false)
        .timeout(20000)
        .first();

      const videoCount = videoCountResult ? parseInt(videoCountResult.total as string, 10) : 0;

      // Buscar contagem de arquivos
      const fileCountResult = await this.db('video as v')
        .join('video_file as vf', 'v.id', 'vf.video_files_id')
        .count('vf.id as total')
        .where('v.show_id', tvShowId)
        .where("deleted", false)
        .timeout(20000)
        .first();

      const fileCount = fileCountResult ? parseInt(fileCountResult.total as string, 10) : 0;

      // Buscar dados do TV Show para outras estatísticas
      const tvShow = await this.findByIdForApi(tvShowId);

      const stats = {
        videoCount,
        fileCount,
        questionCount: 0, // TODO: implementar quando tivermos tabela de questões
        totalDuration: tvShow?.total_load || '0h 0m',
        popularity: tvShow?.popularity || 0,
        voteAverage: tvShow?.vote_average || 0,
        voteCount: tvShow?.vote_count || 0
      };

      console.log(`✅ Estatísticas calculadas:`, stats);
      
      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas do TV Show:', error);
      throw error;
    }
  }
}