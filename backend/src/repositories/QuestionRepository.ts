import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Question } from '../entities/Question';

export interface CreateQuestionData extends Omit<Question, 'id' | 'created_at' | 'updated_at' | 'quiz'> {}
export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

export class QuestionRepository extends ExtendedRepository<Question> {
  constructor() {
    super('questions');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Question>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('question');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('question.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('question.id', 'DESC')
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
          SELECT * FROM question
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM question
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
      console.error(`Erro ao buscar registros de question:`, error);
      throw error;
    }
  }

  async createQuestion(data: CreateQuestionData): Promise<Question> {
    return this.create(data);
  }

  async updateQuestion(id: string, data: UpdateQuestionData): Promise<Question | null> {
    return this.update(id, data);
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async findByQuiz(quizId: string): Promise<Question[]> {
    return this.findAll({ quiz_id: parseInt(quizId) } as Partial<Question>);
  }

  async findByType(type: string): Promise<Question[]> {
    return this.findAll({ type } as Partial<Question>);
  }
}