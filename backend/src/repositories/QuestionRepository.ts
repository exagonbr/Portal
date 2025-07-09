import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Question } from '../entities/Question';
import { QuestionFilterDto } from '../dto/QuestionDto';

export class QuestionRepository {
  private repository: Repository<Question>;

  constructor() {
    this.repository = AppDataSource.getRepository(Question);
  }

  async findAll(filters: QuestionFilterDto = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      deleted, 
      tvShowId, 
      episodeId, 
      fileId 
    } = filters;
    
    const queryBuilder = this.repository.createQueryBuilder('question');
    
    // Aplicar filtros
    if (search) {
      queryBuilder.andWhere('question.test ILIKE :search', { search: `%${search}%` });
    }
    
    if (deleted !== undefined) {
      queryBuilder.andWhere('question.deleted = :deleted', { deleted });
    }
    
    if (tvShowId) {
      queryBuilder.andWhere('question.tvShowId = :tvShowId', { tvShowId });
    }
    
    if (episodeId) {
      queryBuilder.andWhere('question.episodeId = :episodeId', { episodeId });
    }
    
    if (fileId) {
      queryBuilder.andWhere('question.fileId = :fileId', { fileId });
    }
    
    // Paginação
    const total = await queryBuilder.getCount();
    const questions = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('question.dateCreated', 'DESC')
      .getMany();
    
    return {
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: number): Promise<Question | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['answers']
    });
  }

  async create(questionData: Partial<Question>): Promise<Question> {
    const question = this.repository.create(questionData);
    return await this.repository.save(question);
  }

  async update(id: number, questionData: Partial<Question>): Promise<Question | null> {
    await this.repository.update(id, questionData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { deleted: true });
    return (result.affected ?? 0) > 0;
  }

  async restore(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { deleted: false });
    return (result.affected ?? 0) > 0;
  }

  async findByTvShow(tvShowId: number): Promise<Question[]> {
    return await this.repository.find({
      where: { tvShowId, deleted: false }
    });
  }

  async findByEpisode(episodeId: number): Promise<Question[]> {
    return await this.repository.find({
      where: { episodeId, deleted: false }
    });
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
