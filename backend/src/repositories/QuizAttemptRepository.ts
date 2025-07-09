import { BaseRepository } from './BaseRepository';
import { QuizAttempt } from '../entities/QuizAttempt';

export interface CreateQuizAttemptData extends Omit<QuizAttempt, 'id' | 'created_at' | 'updated_at' | 'quiz' | 'user'> {}
export interface UpdateQuizAttemptData extends Partial<CreateQuizAttemptData> {}

export class QuizAttemptRepository extends BaseRepository<QuizAttempt> {
  constructor() {
    super("quiz_attempts");
  }

  async startAttempt(quizId: number, userId: number): Promise<QuizAttempt> {
    // Verificar quantas tentativas o usuário já fez
    const attempts = await this.findAll({
      quiz_id: quizId,
      user_id: userId
    } as Partial<QuizAttempt>);
    
    const attemptNumber = attempts.length + 1;
    
    return this.create({
      quiz_id: quizId,
      user_id: userId,
      status: 'started',
      attempt_number: attemptNumber
    });
  }

  async updateAttemptStatus(attemptId: number, status: string, answers?: Record<string, any>): Promise<QuizAttempt | null> {
    const updateData: UpdateQuizAttemptData = { status };
    
    if (answers) {
      updateData.answers = answers;
    }
    
    return this.update(attemptId, updateData);
  }

  async submitAttempt(attemptId: number, score: number, answers: Record<string, any>): Promise<QuizAttempt | null> {
    return this.update(attemptId, {
      score,
      answers,
      status: 'completed',
      completed_at: new Date()
    });
  }

  async getUserAttempts(quizId: number, userId: number): Promise<QuizAttempt[]> {
    return this.findAll({
      quiz_id: quizId,
      user_id: userId
    } as Partial<QuizAttempt>);
  }

  async getLatestAttempt(quizId: number, userId: number): Promise<QuizAttempt | null> {
    const [attempt] = await this.db(this.tableName)
      .where({
        quiz_id: quizId,
        user_id: userId
      })
      .orderBy('created_at', 'desc')
      .limit(1);
    
    return attempt || null;
  }

  async getCompletedAttempts(quizId: number, userId: number): Promise<QuizAttempt[]> {
    return this.findAll({
      quiz_id: quizId,
      user_id: userId,
      status: 'completed'
    } as Partial<QuizAttempt>);
  }

  async getAttemptDetails(attemptId: number): Promise<QuizAttempt | null> {
    return this.findById(attemptId);
  }

  async abandonAttempt(attemptId: number): Promise<QuizAttempt | null> {
    return this.update(attemptId, {
      status: 'abandoned'
    });
  }
} 