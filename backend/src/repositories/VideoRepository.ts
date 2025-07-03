import { BaseRepository } from './BaseRepository';
import { Video, CreateVideoData, UpdateVideoData } from '../models/Video';

export class VideoRepository extends BaseRepository<Video> {
  constructor() {
    super('videos');
  }

  async findByCourse(courseId: string): Promise<Video[]> {
    return this.findAll({ course_id: courseId } as Partial<Video>);
  }

  async createVideo(data: CreateVideoData): Promise<Video> {
    return this.create(data);
  }

  async updateVideo(id: string, data: UpdateVideoData): Promise<Video | null> {
    return this.update(id, data);
  }

  async deleteVideo(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async searchVideos(searchTerm: string, courseId?: string): Promise<Video[]> {
    let query = this.db.queryBuilder().from(this.tableName)
      .where('title', 'ilike', `%${searchTerm}%`)
      .orWhere('description', 'ilike', `%${searchTerm}%`);

    if (courseId) {
      query = query.andWhere('course_id', courseId);
    }

    return query.select('*');
  }

  async getVideosWithCourse(): Promise<any[]> {
    return this.db.queryBuilder().from(this.tableName)
      .select(
        'videos.*',
        'courses.name as course_name'
      )
      .leftJoin('courses', 'videos.course_id', 'courses.id');
  }

  async getVideoWithCourse(id: string): Promise<any | null> {
    const result = await this.db.queryBuilder().from(this.tableName)
      .select(
        'videos.*',
        'courses.name as course_name'
      )
      .leftJoin('courses', 'videos.course_id', 'courses.id')
      .where('videos.id', id)
      .first();

    return result || null;
  }

  async updateVideoProgress(videoId: string, userId: string, progress: number): Promise<void> {
    const existingProgress = await this.db.queryBuilder().from('user_progress')
      .where({ user_id: userId, video_id: videoId })
      .first();

    if (existingProgress) {
      await this.db.queryBuilder().from('user_progress')
        .where({ user_id: userId, video_id: videoId })
        .update({
          progress_percentage: progress,
          updated_at: new Date()
        });
    } else {
      await this.db.queryBuilder().from('user_progress').insert({
        user_id: userId,
        video_id: videoId,
        progress_percentage: progress,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  async getUserVideoProgress(videoId: string, userId: string): Promise<any | null> {
    return this.db.queryBuilder().from('user_progress')
      .where({ user_id: userId, video_id: videoId })
      .first();
  }

  async getVideosByDuration(minDuration?: string, maxDuration?: string): Promise<Video[]> {
    let query = this.db.queryBuilder().from(this.tableName);

    if (minDuration) {
      query = query.where('duration', '>=', minDuration);
    }

    if (maxDuration) {
      query = query.where('duration', '<=', maxDuration);
    }

    return query.select('*');
  }

  async updateProgress(id: string, progress: number): Promise<Video | null> {
    return this.update(id, { progress } as Partial<Video>);
  }

  async getVideoStream(id: string): Promise<{ file_path: string } | null> {
    const result = await this.db.queryBuilder().from(this.tableName)
      .select('file_path')
      .where('id', id)
      .first();

    return result || null;
  }

  async getVideoThumbnail(id: string): Promise<{ thumbnail_path: string } | null> {
    const result = await this.db.queryBuilder().from(this.tableName)
      .select('thumbnail_path')
      .where('id', id)
      .first();

    return result || null;
  }
}
