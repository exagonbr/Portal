import { BaseRepository } from './BaseRepository';
import { Video } from '../entities/Video';

export interface CreateVideoData extends Omit<Video, 'id'> {}
export interface UpdateVideoData extends Partial<CreateVideoData> {}

export class VideoRepository extends BaseRepository<Video> {
  constructor() {
    super('video');
  }

  async createVideo(data: CreateVideoData): Promise<Video> {
    return this.create(data);
  }

  async updateVideo(id: number, data: UpdateVideoData): Promise<Video | null> {
    return this.update(id, data);
  }

  async deleteVideo(id: number): Promise<boolean> {
    return this.delete(id);
  }

  async findByTitle(title: string): Promise<Video[]> {
    return this.db(this.tableName).where('title', 'ilike', `%${title}%`);
  }

  async findByShowId(showId: number): Promise<Video[]> {
    return this.findAll({ showId } as Partial<Video>);
  }

  async search(term: string): Promise<Video[]> {
    return this.db(this.tableName)
      .where('title', 'ilike', `%${term}%`)
      .orWhere('overview', 'ilike', `%${term}%`);
  }

  // A lógica de progresso do usuário geralmente fica em uma tabela separada (ex: user_video_progress)
  // Os métodos abaixo são exemplos e precisariam dessa tabela de junção.

  async updateUserProgress(userId: number, videoId: number, progressSeconds: number): Promise<void> {
    // Exemplo:
    // await this.db('user_video_progress')
    //   .insert({ user_id: userId, video_id: videoId, progress_seconds: progressSeconds })
    //   .onConflict(['user_id', 'video_id'])
    //   .merge();
    console.log(`Progresso de ${progressSeconds}s salvo para usuário ${userId} no vídeo ${videoId}`);
  }

  async getUserProgress(userId: number, videoId: number): Promise<number | null> {
    // Exemplo:
    // const result = await this.db('user_video_progress')
    //   .where({ user_id: userId, video_id: videoId })
    //   .first();
    // return result?.progress_seconds || null;
    console.log(`Buscando progresso para usuário ${userId} no vídeo ${videoId}`);
    return null;
  }
}