import { Repository, DeleteResult } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Answer } from '../entities/Answer';
import { AnswerFilterDto } from '../dto/AnswerDto';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';

export class AnswerRepository extends ExtendedRepository<Answer> {
  private repository: Repository<Answer>;

  constructor() {
    super("answers"); // Nome da tabela
    this.repository = AppDataSource.getRepository(Answer);
  }
  
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Answer>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('answer');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('answer.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('answer.id', 'DESC')
          .getManyAndCount();
          
        return {
          data,
          total,
          page,
          limit
        };
      } else {
        // Fallback para query raw
        const query = `
          SELECT * FROM answer
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM answer
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
        `;

        const [data, countResult] = await Promise.all([
          AppDataSource.query(query),
          AppDataSource.query(countQuery)
        ]);

        const total = parseInt(countResult[0].total);

        return {
          data,
          total,
          page,
          limit
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar registros de answer:`, error);
      throw error;
    }
  }

  // Implementação compatível com a classe base
  async findAll(filters?: Partial<Answer>, pagination?: { page: number; limit: number }): Promise<Answer[]> {
    const queryBuilder = this.repository.createQueryBuilder('answer');
    
    // Aplicar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryBuilder.andWhere(`answer.${key} = :${key}`, { [key]: value });
        }
      });
    }
    
    // Aplicar paginação se fornecida
    if (pagination) {
      const { page, limit } = pagination;
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit);
    }
    
    return await queryBuilder
      .orderBy('answer.dateCreated', 'DESC')
      .getMany();
  }
  
  // Método personalizado para busca com filtros específicos
  async findAllWithFilters(filters: AnswerFilterDto = {}) {
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
