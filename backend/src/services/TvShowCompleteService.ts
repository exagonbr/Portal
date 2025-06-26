import { AppDataSource } from '../config/typeorm.config';

export class TvShowCompleteService {
  // Função auxiliar para construir URL da imagem
  private buildImageUrl(sha256hex: string | null, extension: string | null): string | null {
    if (!sha256hex || !extension) return null;
    
    return `https://d26a2wm7tuz2gu.cloudfront.net/upload/${sha256hex}${extension.toLowerCase()}`;
  }

  // ===================== TV SHOW CRUD =====================

  async getAllTvShows(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    
    // Query SQL pura para buscar TV Shows com JOINs para imagens e contagem de vídeos
    let query = `
      SELECT
        ts.id,
        ts.name,
        ts.overview,
        ts.producer,
        ts.poster_path,
        ts.backdrop_path,
        ts.total_load,
        ts.popularity,
        ts.vote_average,
        ts.vote_count,
        ts.api_id,
        ts.imdb_id,
        ts.original_language,
        ts.first_air_date,
        ts.contract_term_end,
        ts.poster_image_id,
        ts.backdrop_image_id,
        ts.version,
        ts.date_created,
        ts.last_updated,
        pf.sha256hex as poster_sha256hex,
        pf.extension as poster_extension,
        bf.sha256hex as backdrop_sha256hex,
        bf.extension as backdrop_extension,
        COALESCE(v.video_count, 0) as video_count
      FROM tv_show ts
      LEFT JOIN file pf ON ts.poster_image_id = pf.id
      LEFT JOIN file bf ON ts.backdrop_image_id = bf.id
      LEFT JOIN (
        SELECT show_id, COUNT(*) as video_count
        FROM video
        WHERE deleted IS NULL OR deleted = false
        GROUP BY show_id
      ) v ON ts.id = v.show_id
      WHERE (ts.deleted IS NULL OR ts.deleted = false)
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (ts.name ILIKE $${paramIndex} OR ts.producer ILIKE $${paramIndex} OR ts.overview ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY ts.name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Query para contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM tv_show ts
      WHERE (ts.deleted IS NULL OR ts.deleted = false)
    `;

    const countParams: any[] = [];
    if (search) {
      countQuery += ` AND (ts.name ILIKE $1 OR ts.producer ILIKE $1 OR ts.overview ILIKE $1)`;
      countParams.push(`%${search}%`);
    }

    try {
      const [tvShows, countResult] = await Promise.all([
        AppDataSource.query(query, params),
        AppDataSource.query(countQuery, countParams)
      ]);

      const total = parseInt(countResult[0].total);
      const totalPages = Math.ceil(total / limit);

      // Construir URLs das imagens para cada TV Show
      const tvShowsWithImages = tvShows.map((tvShow: any) => ({
        ...tvShow,
        poster_image_url: this.buildImageUrl(tvShow.poster_sha256hex, tvShow.poster_extension),
        backdrop_image_url: this.buildImageUrl(tvShow.backdrop_sha256hex, tvShow.backdrop_extension)
        // video_count já vem da query SQL
      }));

      return {
        tvShows: tvShowsWithImages,
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Erro na consulta getAllTvShows:', error);
      throw new Error(`Erro ao buscar TV Shows: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTvShowById(id: number) {
    // Query SQL pura para buscar um TV Show específico
    const query = `
      SELECT 
        ts.id,
        ts.name,
        ts.overview,
        ts.producer,
        ts.poster_path,
        ts.backdrop_path,
        ts.total_load,
        ts.popularity,
        ts.vote_average,
        ts.vote_count,
        ts.api_id,
        ts.imdb_id,
        ts.original_language,
        ts.first_air_date,
        ts.contract_term_end,
        ts.poster_image_id,
        ts.backdrop_image_id,
        ts.manual_support_path,
        ts.version,
        ts.date_created,
        ts.last_updated,
        pf.sha256hex as poster_sha256hex,
        pf.extension as poster_extension,
        bf.sha256hex as backdrop_sha256hex,
        bf.extension as backdrop_extension
      FROM tv_show ts
      LEFT JOIN file pf ON ts.poster_image_id = pf.id
      LEFT JOIN file bf ON ts.backdrop_image_id = bf.id
      WHERE ts.id = $1 AND (ts.deleted IS NULL OR ts.deleted = false)
    `;

    try {
      const tvShowResult = await AppDataSource.query(query, [id]);
      
      if (!tvShowResult || tvShowResult.length === 0) {
        throw new Error('TV Show não encontrado');
      }

      const tvShow = tvShowResult[0];

      // Buscar vídeos agrupados por sessão
      const videosGrouped = await this.getVideosByTvShowGrouped(id);

      return {
        ...tvShow,
        poster_image_url: this.buildImageUrl(tvShow.poster_sha256hex, tvShow.poster_extension),
        backdrop_image_url: this.buildImageUrl(tvShow.backdrop_sha256hex, tvShow.backdrop_extension),
        videos: videosGrouped,
        questions: [] // Por enquanto vazio
      };
    } catch (error) {
      console.error('Erro na consulta getTvShowById:', error);
      throw new Error(`Erro ao buscar TV Show: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async searchTvShows(searchTerm: string, page: number = 1, limit: number = 10) {
    return this.getAllTvShows(page, limit, searchTerm);
  }

  // ===================== VIDEO METHODS =====================

  async getVideosByTvShow(id: number): Promise<any[]> {
    try {
      // Query SQL para buscar vídeos da tabela video vinculados pelo show_id
      const query = `
        SELECT 
          v.id,
          v.show_id,
          v.title,
          v.name,
          v.overview as description,
          v.season_number,
          v.episode_number,
          v.duration,
          v.poster_path,
          v.backdrop_path,
          v.still_path,
          v.air_date,
          v.deleted,
          v.date_created,
          v.last_updated
        FROM video v
        WHERE v.show_id = $1 AND (v.deleted IS NULL OR v.deleted = false)
        ORDER BY v.season_number ASC, v.episode_number ASC
      `;

      const result = await AppDataSource.query(query, [id]);
      
      // Formatar dados dos vídeos
      const formattedVideos = result.map((video: any) => ({
        id: video.id,
        show_id: video.show_id,
        title: video.title || video.name || 'Vídeo sem título',
        description: video.description || 'Descrição não disponível',
        video_url: null, // Campo não existe na tabela atual
        module_number: video.season_number || 1,
        session_number: video.season_number || 1, // Usar season_number como session_number
        episode_number: video.episode_number || 1,
        duration: video.duration || null,
        duration_seconds: null, // Campo não existe na tabela atual
        thumbnail_url: video.still_path || video.poster_path || video.backdrop_path || null,
        is_active: !(video.deleted === true),
        created_at: video.date_created,
        updated_at: video.last_updated
      }));

      console.log(`✅ Encontrados ${formattedVideos.length} vídeos para TV Show ID: ${id}`);
      return formattedVideos;
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      return []; // Retornar array vazio em caso de erro
    }
  }

  async getVideosByTvShowGrouped(id: number): Promise<Record<string, any[]>> {
    try {
      const videos = await this.getVideosByTvShow(id);
      
      if (!videos || videos.length === 0) {
        return {};
      }

      // Agrupar por season_number como sessão
      const grouped = videos.reduce((acc: Record<string, any[]>, video: any) => {
        // Usar season_number como número da sessão
        const sessionNumber = video.session_number || 1;
        const key = `session_${sessionNumber}`;
        
        if (!acc[key]) {
          acc[key] = [];
        }
        
        acc[key].push(video);
        return acc;
      }, {} as Record<string, any[]>);

      // Ordenar vídeos dentro de cada sessão por episode_number
      Object.keys(grouped).forEach(key => {
        grouped[key].sort((a: any, b: any) => {
          const episodeA = a.episode_number || 0;
          const episodeB = b.episode_number || 0;
          return episodeA - episodeB;
        });
      });

      return grouped;
    } catch (error) {
      console.error('Erro ao buscar vídeos agrupados:', error);
      throw new Error('Erro interno do servidor');
    }
  }

  // ===================== PLACEHOLDER METHODS =====================
  // Métodos placeholder para manter compatibilidade com o controlador

  async createTvShow(data: any) {
    throw new Error('Método não implementado');
  }

  async updateTvShow(id: number, data: any) {
    throw new Error('Método não implementado');
  }

  async deleteTvShow(id: number) {
    throw new Error('Método não implementado');
  }

  async getVideoById(id: number) {
    throw new Error('Método não implementado');
  }

  async createVideo(data: any) {
    throw new Error('Método não implementado');
  }

  async updateVideo(id: number, data: any) {
    throw new Error('Método não implementado');
  }

  async deleteVideo(id: number) {
    throw new Error('Método não implementado');
  }

  async getQuestionsByTvShow(tvShowId: number) {
    return [];
  }

  async getQuestionById(id: number) {
    throw new Error('Método não implementado');
  }

  async createQuestion(data: any) {
    throw new Error('Método não implementado');
  }

  async updateQuestion(id: number, data: any) {
    throw new Error('Método não implementado');
  }

  async deleteQuestion(id: number) {
    throw new Error('Método não implementado');
  }

  async getAnswersByQuestion(questionId: number) {
    return [];
  }

  async createAnswer(data: any) {
    throw new Error('Método não implementado');
  }

  async updateAnswer(id: number, data: any) {
    throw new Error('Método não implementado');
  }

  async deleteAnswer(id: number) {
    throw new Error('Método não implementado');
  }

  async getFilesByTvShow(tvShowId: number) {
    return [];
  }

  async createFile(data: any) {
    throw new Error('Método não implementado');
  }

  async updateFile(id: number, data: any) {
    throw new Error('Método não implementado');
  }

  async deleteFile(id: number) {
    throw new Error('Método não implementado');
  }

  async getTvShowStats(tvShowId: number) {
    // Por enquanto retornar estatísticas vazias devido a problema com a tabela video
    return {
      videoCount: 0,
      questionCount: 0,
      fileCount: 0
    };
  }
}