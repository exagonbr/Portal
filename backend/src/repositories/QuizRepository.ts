import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Quiz } from '../entities/Quiz';
import { Question } from '../entities/Question';

// Supondo que exista uma entidade QuizAttempt
// import { QuizAttempt } from '../entities/QuizAttempt';

export interface CreateQuizData extends Omit<Quiz, 'id' | 'created_at' | 'updated_at' | 'questions'> {}
export interface UpdateQuizData extends Partial<CreateQuizData> {}

export class QuizRepository extends ExtendedRepository<Quiz> {
  // private attemptRepository: BaseRepository<QuizAttempt>;

  constructor() {
    super('quizzes');
    // this.attemptRepository = new BaseRepository<QuizAttempt>('quiz_attempts');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Quiz>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('quiz');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('quiz.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('quiz.id', 'DESC')
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
          SELECT * FROM quiz
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM quiz
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
      console.error(`Erro ao buscar registros de quiz:`, error);
      throw error;
    }
  }

  // Métodos para Quiz
  async createQuiz(data: CreateQuizData): Promise<Quiz> {
    return this.create(data);
  }

  async updateQuiz(id: string, data: UpdateQuizData): Promise<Quiz | null> {
    return this.update(id, data);
  }

  async deleteQuiz(id: string): Promise<boolean> {
    // Considerar deletar questões e tentativas associadas em cascata
    await this.db('questions').where('quiz_id', id).del();
    return this.delete(id);
  }

  async findByTitle(title: string): Promise<Quiz[]> {
    return this.db(this.tableName).where('title', 'ilike', `%${title}%`);
  }

  async getQuestions(quizId: string): Promise<Question[]> {
    return this.db('questions').where('quiz_id', quizId).orderBy('order', 'asc');
  }

  // Métodos para QuizAttempt (exemplo)
  /*
  async startAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
    return this.attemptRepository.create({ quiz_id: quizId, user_id: userId, status: 'started' });
  }

  async submitAttempt(attemptId: string, score: number): Promise<QuizAttempt | null> {
    return this.attemptRepository.update(attemptId, { score, status: 'completed', completed_at: new Date() });
  }

  async getUserAttempts(quizId: string, userId: string): Promise<QuizAttempt[]> {
    return this.attemptRepository.findAll({ quiz_id: quizId, user_id: userId });
  }
  */
}