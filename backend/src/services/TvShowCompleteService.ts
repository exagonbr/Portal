import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { TvShowComplete, TvShowVideo, TvShowQuestion, TvShowAnswer, TvShowFile } from '../entities/TvShowComplete';

export class TvShowCompleteService {
  private tvShowRepository: Repository<TvShowComplete>;
  private videoRepository: Repository<TvShowVideo>;
  private questionRepository: Repository<TvShowQuestion>;
  private answerRepository: Repository<TvShowAnswer>;
  private fileRepository: Repository<TvShowFile>;

  constructor() {
    this.tvShowRepository = AppDataSource.getRepository(TvShowComplete);
    this.videoRepository = AppDataSource.getRepository(TvShowVideo);
    this.questionRepository = AppDataSource.getRepository(TvShowQuestion);
    this.answerRepository = AppDataSource.getRepository(TvShowAnswer);
    this.fileRepository = AppDataSource.getRepository(TvShowFile);
  }

  // ===================== TV SHOW METHODS =====================

  async getAllTvShows(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.tvShowRepository.createQueryBuilder('tvShow')
      .where('tvShow.deleted = :deleted', { deleted: false });

    if (search) {
      queryBuilder.andWhere('tvShow.name ILIKE :search', { search: `%${search}%` });
    }

    const [shows, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: shows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTvShowById(id: number) {
    const show = await this.tvShowRepository.findOne({
      where: { id, deleted: false }
    });

    if (!show) {
      throw new Error('TV Show não encontrado');
    }

    return show;
  }

  async createTvShow(data: Partial<TvShowComplete>) {
    const show = this.tvShowRepository.create(data);
    return await this.tvShowRepository.save(show);
  }

  async updateTvShow(id: number, data: Partial<TvShowComplete>) {
    const show = await this.getTvShowById(id);
    Object.assign(show, data);
    return await this.tvShowRepository.save(show);
  }

  async deleteTvShow(id: number) {
    const show = await this.getTvShowById(id);
    show.deleted = true;
    await this.tvShowRepository.save(show);
  }

  async searchTvShows(query: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [shows, total] = await this.tvShowRepository.findAndCount({
      where: [
        { name: query },
        { overview: query }
      ],
      skip,
      take: limit
    });

    return {
      data: shows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ===================== VIDEO METHODS =====================

  async getVideosByTvShow(tvShowId: number) {
    return await this.videoRepository.find({
      where: { tv_show_id: tvShowId, is_active: true },
      order: { module_number: 'ASC', episode_number: 'ASC' }
    });
  }

  async getVideosByTvShowGrouped(tvShowId: number) {
    const videos = await this.getVideosByTvShow(tvShowId);

    // Group videos by module
    const modules = videos.reduce((acc, video) => {
      const moduleNumber = video.module_number || 1;
      
      if (!acc[moduleNumber]) {
        acc[moduleNumber] = {
          moduleNumber,
          videos: []
        };
      }

      acc[moduleNumber].videos.push(video);
      return acc;
    }, {} as Record<number, { moduleNumber: number; videos: TvShowVideo[] }>);

    return Object.values(modules);
  }

  async getVideoById(id: number) {
    const video = await this.videoRepository.findOne({
      where: { id, is_active: true }
    });

    if (!video) {
      throw new Error('Vídeo não encontrado');
    }

    return video;
  }

  async createVideo(data: Partial<TvShowVideo>) {
    const video = this.videoRepository.create(data);
    return await this.videoRepository.save(video);
  }

  async updateVideo(id: number, data: Partial<TvShowVideo>) {
    const video = await this.getVideoById(id);
    Object.assign(video, data);
    return await this.videoRepository.save(video);
  }

  async deleteVideo(id: number) {
    const video = await this.getVideoById(id);
    video.is_active = false;
    await this.videoRepository.save(video);
  }

  // ===================== QUESTION METHODS =====================

  async getQuestionsByTvShow(tvShowId: number) {
    return await this.questionRepository.find({
      where: { tv_show_id: tvShowId, is_active: true },
      order: { order_number: 'ASC' }
    });
  }

  async getQuestionById(id: number) {
    const question = await this.questionRepository.findOne({
      where: { id, is_active: true }
    });

    if (!question) {
      throw new Error('Questão não encontrada');
    }

    return question;
  }

  async createQuestion(data: Partial<TvShowQuestion>) {
    const question = this.questionRepository.create(data);
    return await this.questionRepository.save(question);
  }

  async updateQuestion(id: number, data: Partial<TvShowQuestion>) {
    const question = await this.getQuestionById(id);
    Object.assign(question, data);
    return await this.questionRepository.save(question);
  }

  async deleteQuestion(id: number) {
    const question = await this.getQuestionById(id);
    question.is_active = false;
    await this.questionRepository.save(question);
  }

  // ===================== ANSWER METHODS =====================

  async getAnswersByQuestion(questionId: number) {
    return await this.answerRepository.find({
      where: { question_id: questionId, is_active: true },
      order: { order_number: 'ASC' }
    });
  }

  async createAnswer(data: Partial<TvShowAnswer>) {
    const answer = this.answerRepository.create(data);
    return await this.answerRepository.save(answer);
  }

  async updateAnswer(id: number, data: Partial<TvShowAnswer>) {
    const answer = await this.answerRepository.findOne({ where: { id } });
    if (!answer) {
      throw new Error('Resposta não encontrada');
    }
    Object.assign(answer, data);
    return await this.answerRepository.save(answer);
  }

  async deleteAnswer(id: number) {
    const answer = await this.answerRepository.findOne({ where: { id } });
    if (!answer) {
      throw new Error('Resposta não encontrada');
    }
    answer.is_active = false;
    await this.answerRepository.save(answer);
  }

  // ===================== FILE METHODS =====================

  async getFilesByTvShow(tvShowId: number) {
    return await this.fileRepository.find({
      where: { tv_show_id: tvShowId }
    });
  }

  async createFile(data: Partial<TvShowFile>) {
    const file = this.fileRepository.create(data);
    return await this.fileRepository.save(file);
  }

  async updateFile(id: number, data: Partial<TvShowFile>) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new Error('Arquivo não encontrado');
    }
    Object.assign(file, data);
    return await this.fileRepository.save(file);
  }

  async deleteFile(id: number) {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new Error('Arquivo não encontrado');
    }
    await this.fileRepository.remove(file);
  }

  // ===================== STATS METHODS =====================

  async getTvShowStats(tvShowId: number) {
    const show = await this.getTvShowById(tvShowId);
    const videos = await this.getVideosByTvShow(tvShowId);
    const questions = await this.getQuestionsByTvShow(tvShowId);

    return {
      tvShow: show,
      totalVideos: videos.length,
      totalQuestions: questions.length,
      totalModules: new Set(videos.map(v => v.module_number)).size,
      averageVideoLength: videos.reduce((acc, v) => acc + (v.duration_seconds || 0), 0) / videos.length
    };
  }
}
