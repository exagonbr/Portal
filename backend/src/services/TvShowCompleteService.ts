import { AppDataSource } from '../config/typeorm.config';
import { Repository, Like, IsNull } from 'typeorm';
import {
  TvShowComplete,
  TvShowVideo,
  TvShowQuestion,
  TvShowAnswer,
  TvShowFile,
  TvShowVideoFile
} from '../entities/TvShowComplete';

export class TvShowCompleteService {
  private tvShowRepo: Repository<TvShowComplete>;
  private videoRepo: Repository<TvShowVideo>;
  private questionRepo: Repository<TvShowQuestion>;
  private answerRepo: Repository<TvShowAnswer>;
  private fileRepo: Repository<TvShowFile>;
  private videoFileRepo: Repository<TvShowVideoFile>;

  constructor() {
    this.tvShowRepo = AppDataSource.getRepository(TvShowComplete);
    this.videoRepo = AppDataSource.getRepository(TvShowVideo);
    this.questionRepo = AppDataSource.getRepository(TvShowQuestion);
    this.answerRepo = AppDataSource.getRepository(TvShowAnswer);
    this.fileRepo = AppDataSource.getRepository(TvShowFile);
    this.videoFileRepo = AppDataSource.getRepository(TvShowVideoFile);
  }

  // ===================== TV SHOW CRUD =====================

  async getAllTvShows(page: number = 1, limit: number = 10) {
    const [tvShows, total] = await this.tvShowRepo.findAndCount({
      relations: ['authors', 'targetAudiences'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      where: { deleted: IsNull() }
    });

    // Contar vídeos para cada tv_show
    const tvShowsWithCounts = await Promise.all(
      tvShows.map(async (tvShow) => {
        const videoCount = await this.videoRepo.count({
          where: { tv_show_id: tvShow.id, is_active: true }
        });

        return {
          ...tvShow,
          video_count: videoCount
        };
      })
    );

    return {
      tvShows: tvShowsWithCounts,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getTvShowById(id: number) {
    const tvShow = await this.tvShowRepo.findOne({
      where: { id, deleted: IsNull() },
      relations: ['authors', 'targetAudiences', 'files']
    });

    if (!tvShow) {
      throw new Error('TV Show não encontrado');
    }

    // Buscar vídeos organizados por módulo
    const videos = await this.videoRepo.find({
      where: { tv_show_id: id, is_active: true },
      relations: ['files'],
      order: { module_number: 'ASC', episode_number: 'ASC' }
    });

    // Buscar questões
    const questions = await this.questionRepo.find({
      where: { tv_show_id: id, is_active: true },
      relations: ['answers'],
      order: { order_number: 'ASC' }
    });

    return {
      ...tvShow,
      videos,
      questions
    };
  }

  async createTvShow(data: Partial<TvShowComplete>) {
    const tvShow = this.tvShowRepo.create({
      ...data,
      date_created: new Date(),
      last_updated: new Date(),
      first_air_date: data.first_air_date || new Date(),
      contract_term_end: data.contract_term_end || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
    });

    return await this.tvShowRepo.save(tvShow);
  }

  async updateTvShow(id: number, data: Partial<TvShowComplete>) {
    const tvShow = await this.getTvShowById(id);
    
    Object.assign(tvShow, {
      ...data,
      last_updated: new Date()
    });

    return await this.tvShowRepo.save(tvShow);
  }

  async deleteTvShow(id: number) {
    const tvShow = await this.getTvShowById(id);
    tvShow.deleted = 'true';
    tvShow.last_updated = new Date();
    
    return await this.tvShowRepo.save(tvShow);
  }

  // ===================== VIDEO CRUD =====================

  async getVideosByTvShow(tvShowId: number) {
    return await this.videoRepo.find({
      where: { tv_show_id: tvShowId, is_active: true },
      relations: ['files'],
      order: { module_number: 'ASC', episode_number: 'ASC' }
    });
  }

  async getVideoById(id: number) {
    const video = await this.videoRepo.findOne({
      where: { id, is_active: true },
      relations: ['tvShow', 'files']
    });

    if (!video) {
      throw new Error('Vídeo não encontrado');
    }

    return video;
  }

  async createVideo(data: Partial<TvShowVideo>) {
    // Verificar se o tv_show existe
    await this.getTvShowById(data.tv_show_id!);
    
    const video = this.videoRepo.create(data);
    return await this.videoRepo.save(video);
  }

  async updateVideo(id: number, data: Partial<TvShowVideo>) {
    const video = await this.getVideoById(id);
    Object.assign(video, data);
    return await this.videoRepo.save(video);
  }

  async deleteVideo(id: number) {
    const video = await this.getVideoById(id);
    video.is_active = false;
    return await this.videoRepo.save(video);
  }

  // ===================== QUESTION CRUD =====================

  async getQuestionsByTvShow(tvShowId: number) {
    return await this.questionRepo.find({
      where: { tv_show_id: tvShowId, is_active: true },
      relations: ['answers'],
      order: { order_number: 'ASC' }
    });
  }

  async getQuestionById(id: number) {
    const question = await this.questionRepo.findOne({
      where: { id, is_active: true },
      relations: ['tvShow', 'video', 'answers']
    });

    if (!question) {
      throw new Error('Questão não encontrada');
    }

    return question;
  }

  async createQuestion(data: Partial<TvShowQuestion>) {
    const question = this.questionRepo.create(data);
    return await this.questionRepo.save(question);
  }

  async updateQuestion(id: number, data: Partial<TvShowQuestion>) {
    const question = await this.getQuestionById(id);
    Object.assign(question, data);
    return await this.questionRepo.save(question);
  }

  async deleteQuestion(id: number) {
    const question = await this.getQuestionById(id);
    question.is_active = false;
    return await this.questionRepo.save(question);
  }

  // ===================== ANSWER CRUD =====================

  async createAnswer(data: Partial<TvShowAnswer>) {
    const answer = this.answerRepo.create(data);
    return await this.answerRepo.save(answer);
  }

  async updateAnswer(id: number, data: Partial<TvShowAnswer>) {
    const answer = await this.answerRepo.findOne({ where: { id } });
    if (!answer) {
      throw new Error('Resposta não encontrada');
    }
    
    Object.assign(answer, data);
    return await this.answerRepo.save(answer);
  }

  async deleteAnswer(id: number) {
    return await this.answerRepo.delete(id);
  }

  // ===================== FILE CRUD =====================

  async getFilesByTvShow(tvShowId: number) {
    return await this.fileRepo.find({
      where: { tv_show_id: tvShowId },
      order: { created_at: 'DESC' }
    });
  }

  async createFile(data: Partial<TvShowFile>) {
    const file = this.fileRepo.create(data);
    return await this.fileRepo.save(file);
  }

  async deleteFile(id: number) {
    return await this.fileRepo.delete(id);
  }

  // ===================== VIDEO FILE CRUD =====================

  async getVideoFiles(videoId: number) {
    return await this.videoFileRepo.find({
      where: { video_id: videoId },
      order: { created_at: 'DESC' }
    });
  }

  async createVideoFile(data: Partial<TvShowVideoFile>) {
    const file = this.videoFileRepo.create(data);
    return await this.videoFileRepo.save(file);
  }

  async deleteVideoFile(id: number) {
    return await this.videoFileRepo.delete(id);
  }

  // ===================== UTILITY METHODS =====================

  async getModulesStructure(tvShowId: number) {
    const videos = await this.getVideosByTvShow(tvShowId);
    
    // Agrupar vídeos por módulo
    const modules = videos.reduce((acc, video) => {
      const moduleKey = `M${video.module_number.toString().padStart(2, '0')}`;
      if (!acc[moduleKey]) {
        acc[moduleKey] = [];
      }
      acc[moduleKey].push({
        ...video,
        episode_code: `EP${video.episode_number.toString().padStart(2, '0')}`
      });
      return acc;
    }, {} as Record<string, any[]>);

    return modules;
  }

  async getTvShowStats(tvShowId: number) {
    const [videoCount, questionCount, fileCount] = await Promise.all([
      this.videoRepo.count({ where: { tv_show_id: tvShowId, is_active: true } }),
      this.questionRepo.count({ where: { tv_show_id: tvShowId, is_active: true } }),
      this.fileRepo.count({ where: { tv_show_id: tvShowId } })
    ]);

    return {
      videoCount,
      questionCount,
      fileCount
    };
  }

  async searchTvShows(query: string, page: number = 1, limit: number = 10) {
    const [tvShows, total] = await this.tvShowRepo.findAndCount({
      where: [
        { name: Like(`%${query}%`), deleted: IsNull() },
        { overview: Like(`%${query}%`), deleted: IsNull() },
        { producer: Like(`%${query}%`), deleted: IsNull() }
      ],
      relations: ['authors', 'targetAudiences'],
      order: { popularity: 'DESC', created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      tvShows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query
    };
  }
} 