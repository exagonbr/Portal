import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Video } from '../entities/Video';

export interface CreateVideoData extends Omit<Video, 'id'> {}
export interface UpdateVideoData extends Partial<CreateVideoData> {}

export class VideoRepository extends ExtendedRepository<Video> {
  private repository: Repository<Video>;

  constructor() {
    super("videos");
    this.repository = AppDataSource.getRepository(Video);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Video>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select("*");

      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike("name", `%${search}%`);
      }

      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("id", "DESC")
        .limit(limit)
        .offset(offset);

      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify(qb => {
          if (search) {
            qb.whereILike("name", `%${search}%`);
          }
        })
        .first();

      const total = parseInt(countResult?.total as string, 10) || 0;

      return {
        data,
        total,
        page,
        limit
      };
    } catch (error) {
      throw error;
    }
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
