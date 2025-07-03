import { BaseRepository } from './BaseRepository';
import { TvShow } from '../entities/TvShow';

export class TvShowRepository extends BaseRepository<TvShow> {
  constructor() {
    super('tv_shows');
  }

  async findByInstitution(institutionId: string): Promise<TvShow[]> {
    return this.db('tv_shows')
      .where('institution_id', institutionId)
      .where('status', 'published')
      .orderBy('created_at', 'desc');
  }

  async findFeatured(limit: number = 10): Promise<TvShow[]> {
    return this.db('tv_shows')
      .where('is_featured', true)
      .where('status', 'published')
      .where('is_public', true)
      .orderBy('views_count', 'desc')
      .limit(limit);
  }

  async findByGenre(genre: string, limit: number = 20): Promise<TvShow[]> {
    return this.db('tv_shows')
      .where('genre', genre)
      .where('status', 'published')
      .where('is_public', true)
      .orderBy('rating_average', 'desc')
      .limit(limit);
  }

  async searchTvShows(searchTerm: string, institutionId?: string): Promise<TvShow[]> {
    let query = this.db('tv_shows')
      .where('status', 'published')
      .where(function() {
        this.where('title', 'ilike', `%${searchTerm}%`)
          .orWhere('description', 'ilike', `%${searchTerm}%`)
          .orWhere('synopsis', 'ilike', `%${searchTerm}%`)
          .orWhereRaw('tags::text ilike ?', [`%${searchTerm}%`])
          .orWhereRaw('subjects::text ilike ?', [`%${searchTerm}%`]);
      });

    if (institutionId) {
      query = query.where('institution_id', institutionId);
    } else {
      query = query.where('is_public', true);
    }

    return query.orderBy('rating_average', 'desc');
  }

  async getTvShowWithEpisodes(id: string): Promise<any | null> {
    const tvShow = await this.findById(id);
    if (!tvShow) return null;

    const episodes = await this.db('tv_show_videos as tsv')
      .select(
        'tsv.*',
        'v.name as video_name',
        'v.duration',
        'v.thumbnail_url',
        'v.video_url'
      )
      .leftJoin('videos as v', 'tsv.video_id', 'v.id')
      .where('tsv.tv_show_id', id)
      .orderBy(['tsv.season_number', 'tsv.episode_number']);

    return {
      ...tvShow,
      episodes
    };
  }

  async updateStatistics(id: string, type: 'view' | 'like' | 'rating', value?: number): Promise<void> {
    switch (type) {
      case 'view':
        await this.db('tv_shows')
          .where('id', id)
          .increment('views_count', 1);
        break;
      case 'like':
        await this.db('tv_shows')
          .where('id', id)
          .increment('likes_count', 1);
        break;
      case 'rating':
        if (value !== undefined) {
          const current = await this.db('tv_shows')
            .select('rating_average', 'rating_count')
            .where('id', id)
            .first();
          
          if (current) {
            const newCount = current.rating_count + 1;
            const newAverage = ((current.rating_average * current.rating_count) + value) / newCount;
            
            await this.db('tv_shows')
              .where('id', id)
              .update({
                rating_average: newAverage,
                rating_count: newCount
              });
          }
        }
        break;
    }
  }

  async getPopularTvShows(limit: number = 10): Promise<TvShow[]> {
    return this.db('tv_shows')
      .where('status', 'published')
      .where('is_public', true)
      .orderBy('views_count', 'desc')
      .limit(limit);
  }

  async getRecentTvShows(limit: number = 10): Promise<TvShow[]> {
    return this.db('tv_shows')
      .where('status', 'published')
      .where('is_public', true)
      .orderBy('created_at', 'desc')
      .limit(limit);
  }
} 