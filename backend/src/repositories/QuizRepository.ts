import { BaseRepository } from './BaseRepository';
import { Quiz } from '../entities/Quiz';
import { Question } from '../entities/Question';

// Supondo que exista uma entidade QuizAttempt
// import { QuizAttempt } from '../entities/QuizAttempt';

export interface CreateQuizData extends Omit<Quiz, 'id' | 'created_at' | 'updated_at' | 'questions'> {}
export interface UpdateQuizData extends Partial<CreateQuizData> {}

export class QuizRepository extends BaseRepository<Quiz> {
  // private attemptRepository: BaseRepository<QuizAttempt>;

  constructor() {
    super('quizzes');
    // this.attemptRepository = new BaseRepository<QuizAttempt>('quiz_attempts');
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