import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Quiz } from '../entities/Quiz';
import { Question } from '../entities/Question';
import { QuizAttempt } from '../entities/QuizAttempt';
import { QuizAttemptRepository } from './QuizAttemptRepository';

export interface CreateQuizData extends Omit<Quiz, 'id' | 'created_at' | 'updated_at' | 'questions'> {}
export interface UpdateQuizData extends Partial<CreateQuizData> {}

export class QuizRepository extends ExtendedRepository<Quiz> {
  private repository: Repository<Quiz>;
  private attemptRepository: QuizAttemptRepository;

  constructor() {
    super("quizs");
    this.repository = AppDataSource.getRepository(Quiz);
    this.attemptRepository = new QuizAttemptRepository();
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Quiz>> {
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

  // Métodos para QuizAttempt
  async startAttempt(quizId: number, userId: number): Promise<QuizAttempt> {
    return this.attemptRepository.startAttempt(quizId, userId);
  }

  async submitAttempt(attemptId: number, score: number, answers: Record<string, any>): Promise<QuizAttempt | null> {
    return this.attemptRepository.submitAttempt(attemptId, score, answers);
  }

  async getUserAttempts(quizId: number, userId: number): Promise<QuizAttempt[]> {
    return this.attemptRepository.getUserAttempts(quizId, userId);
  }
  
  async getLatestAttempt(quizId: number, userId: number): Promise<QuizAttempt | null> {
    return this.attemptRepository.getLatestAttempt(quizId, userId);
  }

  async getCompletedAttempts(quizId: number, userId: number): Promise<QuizAttempt[]> {
    return this.attemptRepository.getCompletedAttempts(quizId, userId);
  }

  async updateAttemptStatus(attemptId: number, status: string, answers?: Record<string, any>): Promise<QuizAttempt | null> {
    return this.attemptRepository.updateAttemptStatus(attemptId, status, answers);
  }

  async getAttemptDetails(attemptId: number): Promise<QuizAttempt | null> {
    return this.attemptRepository.getAttemptDetails(attemptId);
  }

  async abandonAttempt(attemptId: number): Promise<QuizAttempt | null> {
    return this.attemptRepository.abandonAttempt(attemptId);
  }
}
