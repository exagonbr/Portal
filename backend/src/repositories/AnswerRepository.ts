import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Answer } from '../entities/Answer';
import { AnswerFilterDto } from '../dto/AnswerDto';

export class AnswerRepository {
  private repository: Repository<Answer>;

  constructor() {
    this.repository = AppDataSource.getRepository(Answer);
  }

  async findAll(filters: AnswerFilterDto = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      deleted, 
      isCorrect, 
      questionId 
    } = filters;
    
    const queryBuilder = this.repository.createQueryBuilder('answer');
    
    // Aplicar filtros
    if (search) {
      queryBuilder.andWhere('answer.reply ILIKE :search', { search: `%${search}%` });
    }
    
    if (deleted !== undefined) {
      queryBuilder.andWhere('answer.deleted = :deleted', { deleted });
    }
    
    if (isCorrect !== undefined) {
      queryBuilder.andWhere('answer.isCorrect = :isCorrect', { isCorrect });
    }
    
    if (questionId) {
      queryBuilder.andWhere('answer.questionId = :questionId', { questionId });
    }
    
    // Paginação
    const total = await queryBuilder.getCount();
    const answers = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('answer.dateCreated', 'DESC')
      .getMany();
    
    return {
      data: answers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: number): Promise<Answer | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['question']
    });
  }

  async create(answerData: Partial<Answer>): Promise<Answer> {
    const answer = this.repository.create(answerData);
    return await this.repository.save(answer);
  }

  async update(id: number, answerData: Partial<Answer>): Promise<Answer | null> {
    await this.repository.update(id, answerData);
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

  async findByQuestion(questionId: number): Promise<Answer[]> {
    return await this.repository.find({
      where: { questionId, deleted: false }
    });
  }

  async findCorrectAnswers(questionId: number): Promise<Answer[]> {
    return await this.repository.find({
      where: { questionId, isCorrect: true, deleted: false }
    });
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }
}
