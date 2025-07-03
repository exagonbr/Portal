import db from '../config/database';
import { Video, CreateVideoData, UpdateVideoData, VideoWithRelations } from '../entities/Video';

export class VideoRepository {
  private static readonly TABLE_NAME = 'videos';

  static async findById(id: number): Promise<VideoWithRelations | null> {
    try {
      const video = await db(this.TABLE_NAME)
        .leftJoin('files as poster_image', 'videos.poster_image_id', 'poster_image.id')
        .leftJoin('files as backdrop_image', 'videos.backdrop_image_id', 'backdrop_image.id')
        .leftJoin('files as still_image', 'videos.still_image_id', 'still_image.id')
        .leftJoin('tv_shows as show', 'videos.show_id', 'show.id')
        .select(
          'videos.*',
          'poster_image.id as poster_image_id',
          'poster_image.url as poster_image_url',
          'backdrop_image.id as backdrop_image_id',
          'backdrop_image.url as backdrop_image_url',
          'still_image.id as still_image_id',
          'still_image.url as still_image_url',
          'show.id as show_id',
          'show.title as show_title'
        )
        .where('videos.id', id)
        .first();

      if (!video) return null;

      return this.mapVideoWithRelations(video);
    } catch (error) {
      console.error('Erro ao buscar vídeo por ID:', error);
      throw error;
    }
  }

  static async create(videoData: CreateVideoData): Promise<Video> {
    try {
      const [video] = await db(this.TABLE_NAME)
        .insert({
          ...videoData,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      return video;
    } catch (error) {
      console.error('Erro ao criar vídeo:', error);
      throw error;
    }
  }

  static async update(id: number, videoData: UpdateVideoData): Promise<Video | null> {
    try {
      const [video] = await db(this.TABLE_NAME)
        .where('id', id)
        .update({
          ...videoData,
          updated_at: new Date()
        })
        .returning('*');

      return video || null;
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const deletedRows = await db(this.TABLE_NAME)
        .where('id', id)
        .del();

      return deletedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar vídeo:', error);
      throw error;
    }
  }

  static async findAll(limit?: number, offset?: number): Promise<VideoWithRelations[]> {
    try {
      let query = db(this.TABLE_NAME)
        .leftJoin('files as poster_image', 'videos.poster_image_id', 'poster_image.id')
        .leftJoin('files as backdrop_image', 'videos.backdrop_image_id', 'backdrop_image.id')
        .leftJoin('files as still_image', 'videos.still_image_id', 'still_image.id')
        .leftJoin('tv_shows as show', 'videos.show_id', 'show.id')
        .select(
          'videos.*',
          'poster_image.id as poster_image_id',
          'poster_image.url as poster_image_url',
          'backdrop_image.id as backdrop_image_id',
          'backdrop_image.url as backdrop_image_url',
          'still_image.id as still_image_id',
          'still_image.url as still_image_url',
          'show.id as show_id',
          'show.title as show_title'
        )
        .orderBy('videos.created_at', 'desc');

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const videos = await query;
      return videos.map(video => this.mapVideoWithRelations(video));
    } catch (error) {
      console.error('Erro ao buscar todos os vídeos:', error);
      throw error;
    }
  }

  static async findByShow(showId: number): Promise<VideoWithRelations[]> {
    try {
      const videos = await db(this.TABLE_NAME)
        .leftJoin('files as poster_image', 'videos.poster_image_id', 'poster_image.id')
        .leftJoin('files as backdrop_image', 'videos.backdrop_image_id', 'backdrop_image.id')
        .leftJoin('files as still_image', 'videos.still_image_id', 'still_image.id')
        .leftJoin('tv_shows as show', 'videos.show_id', 'show.id')
        .select(
          'videos.*',
          'poster_image.id as poster_image_id',
          'poster_image.url as poster_image_url',
          'backdrop_image.id as backdrop_image_id',
          'backdrop_image.url as backdrop_image_url',
          'still_image.id as still_image_id',
          'still_image.url as still_image_url',
          'show.id as show_id',
          'show.title as show_title'
        )
        .where('videos.show_id', showId)
        .orderBy('videos.season_number', 'asc')
        .orderBy('videos.episode_number', 'asc');

      return videos.map(video => this.mapVideoWithRelations(video));
    } catch (error) {
      console.error('Erro ao buscar vídeos por show:', error);
      throw error;
    }
  }

  static async findByClass(videoClass: string): Promise<VideoWithRelations[]> {
    try {
      const videos = await db(this.TABLE_NAME)
        .leftJoin('files as poster_image', 'videos.poster_image_id', 'poster_image.id')
        .leftJoin('files as backdrop_image', 'videos.backdrop_image_id', 'backdrop_image.id')
        .leftJoin('files as still_image', 'videos.still_image_id', 'still_image.id')
        .leftJoin('tv_shows as show', 'videos.show_id', 'show.id')
        .select(
          'videos.*',
          'poster_image.id as poster_image_id',
          'poster_image.url as poster_image_url',
          'backdrop_image.id as backdrop_image_id',
          'backdrop_image.url as backdrop_image_url',
          'still_image.id as still_image_id',
          'still_image.url as still_image_url',
          'show.id as show_id',
          'show.title as show_title'
        )
        .where('videos.class', videoClass)
        .orderBy('videos.created_at', 'desc');

      return videos.map(video => this.mapVideoWithRelations(video));
    } catch (error) {
      console.error('Erro ao buscar vídeos por classe:', error);
      throw error;
    }
  }

  static async search(searchTerm: string, limit?: number): Promise<VideoWithRelations[]> {
    try {
      let query = db(this.TABLE_NAME)
        .leftJoin('files as poster_image', 'videos.poster_image_id', 'poster_image.id')
        .leftJoin('files as backdrop_image', 'videos.backdrop_image_id', 'backdrop_image.id')
        .leftJoin('files as still_image', 'videos.still_image_id', 'still_image.id')
        .leftJoin('tv_shows as show', 'videos.show_id', 'show.id')
        .select(
          'videos.*',
          'poster_image.id as poster_image_id',
          'poster_image.url as poster_image_url',
          'backdrop_image.id as backdrop_image_id',
          'backdrop_image.url as backdrop_image_url',
          'still_image.id as still_image_id',
          'still_image.url as still_image_url',
          'show.id as show_id',
          'show.title as show_title'
        )
        .where(function() {
          this.where('videos.title', 'ilike', `%${searchTerm}%`)
            .orWhere('videos.name', 'ilike', `%${searchTerm}%`)
            .orWhere('videos.overview', 'ilike', `%${searchTerm}%`);
        })
        .orderBy('videos.created_at', 'desc');

      if (limit) {
        query = query.limit(limit);
      }

      const videos = await query;
      return videos.map(video => this.mapVideoWithRelations(video));
    } catch (error) {
      console.error('Erro ao pesquisar vídeos:', error);
      throw error;
    }
  }

  static async count(): Promise<number> {
    try {
      const result = await db(this.TABLE_NAME).count('id as total').first();
      return parseInt(result?.total as string) || 0;
    } catch (error) {
      console.error('Erro ao contar vídeos:', error);
      throw error;
    }
  }

  private static mapVideoWithRelations(row: any): VideoWithRelations {
    const video: VideoWithRelations = {
      id: row.id,
      version: row.version,
      api_id: row.api_id,
      date_created: row.date_created,
      deleted: row.deleted,
      imdb_id: row.imdb_id,
      intro_end: row.intro_end,
      intro_start: row.intro_start,
      last_updated: row.last_updated,
      original_language: row.original_language,
      outro_start: row.outro_start,
      overview: row.overview,
      popularity: row.popularity,
      report_count: row.report_count,
      vote_average: row.vote_average,
      vote_count: row.vote_count,
      class: row.class,
      backdrop_path: row.backdrop_path,
      poster_image_id: row.poster_image_id,
      poster_path: row.poster_path,
      release_date: row.release_date,
      title: row.title,
      trailer_key: row.trailer_key,
      backdrop_image_id: row.backdrop_image_id,
      air_date: row.air_date,
      episode_string: row.episode_string,
      episode_number: row.episode_number,
      name: row.name,
      season_episode_merged: row.season_episode_merged,
      season_number: row.season_number,
      show_id: row.show_id,
      still_image_id: row.still_image_id,
      still_path: row.still_path,
      duration: row.duration,
      created_at: row.created_at,
      updated_at: row.updated_at
    };

    if (row.poster_image_url) {
      video.poster_image = {
        id: row.poster_image_id,
        url: row.poster_image_url
      };
    }

    if (row.backdrop_image_url) {
      video.backdrop_image = {
        id: row.backdrop_image_id,
        url: row.backdrop_image_url
      };
    }

    if (row.still_image_url) {
      video.still_image = {
        id: row.still_image_id,
        url: row.still_image_url
      };
    }

    if (row.show_title) {
      video.show = {
        id: row.show_id,
        title: row.show_title
      };
    }

    return video;
  }
}
