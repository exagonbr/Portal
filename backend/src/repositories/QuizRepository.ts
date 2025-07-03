import { BaseRepository } from './BaseRepository';
import { Quiz, CreateQuizData, UpdateQuizData, Question, CreateQuestionData, UpdateQuestionData, QuizAttempt } from '../models/Quiz';

export class QuizRepository extends BaseRepository<Quiz> {
  constructor() {
    super('quizzes');
  }

  async findByCourse(courseId: string): Promise<Quiz[]> {
    return this.findAll({ course_id: courseId } as Partial<Quiz>);
  }

  async findByModule(moduleId: string): Promise<Quiz[]> {
    return this.findAll({ module_id: moduleId } as Partial<Quiz>);
  }

  async createQuiz(data: CreateQuizData): Promise<Quiz> {
    return this.create(data);
  }

  async updateQuiz(id: string, data: UpdateQuizData): Promise<Quiz | null> {
    return this.update(id, data);
  }

  async deleteQuiz(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getQuizQuestions(quizId: string): Promise<Question[]> {
    return this.db('questions')
      .where('quiz_id', quizId)
      .orderBy('order', 'asc')
      .select('*');
  }

  async createQuestion(data: CreateQuestionData): Promise<Question> {
    const [result] = await this.db('questions').insert(data).returning('*');
    return result;
  }

  async updateQuestion(id: string, data: UpdateQuestionData): Promise<Question | null> {
    const [result] = await this.db('questions')
      .where('id', id)
      .update({ ...data, updated_at: new Date() })
      .returning('*');
    return result || null;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const deletedRows = await this.db('questions').where('id', id).del();
    return deletedRows > 0;
  }

  async getQuestion(id: string): Promise<Question | null> {
    const result = await this.db('questions').where('id', id).first();
    return result || null;
  }

  async startQuizAttempt(quizId: string, userId: string): Promise<QuizAttempt> {
    // Get the next attempt number for this user and quiz
    const lastAttempt = await this.db('quiz_attempts')
      .where({ quiz_id: quizId, user_id: userId })
      .orderBy('attempt_number', 'desc')
      .first();

    const attemptNumber = (lastAttempt?.attempt_number || 0) + 1;

    const [result] = await this.db('quiz_attempts').insert({
      quiz_id: quizId,
      user_id: userId,
      attempt_number: attemptNumber,
      started_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }).returning('*');

    return result;
  }

  async submitQuizAttempt(attemptId: string, answers: any, score: number, passed: boolean): Promise<QuizAttempt | null> {
    const [result] = await this.db('quiz_attempts')
      .where('id', attemptId)
      .update({
        answers,
        score,
        passed,
        completed_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');

    return result || null;
  }

  async getQuizAttempts(quizId: string, userId?: string): Promise<QuizAttempt[]> {
    let query = this.db('quiz_attempts')
      .where('quiz_id', quizId);

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    return query
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getQuizAttempt(attemptId: string): Promise<QuizAttempt | null> {
    const result = await this.db('quiz_attempts').where('id', attemptId).first();
    return result || null;
  }

  async getUserQuizAttempts(userId: string, quizId: string): Promise<QuizAttempt[]> {
    return this.db('quiz_attempts')
      .where({ user_id: userId, quiz_id: quizId })
      .orderBy('attempt_number', 'desc')
      .select('*');
  }

  async getQuizWithDetails(id: string): Promise<any | null> {
    const quiz = await this.findById(id);
    if (!quiz) return null;

    const questions = await this.getQuizQuestions(id);
    
    return {
      ...quiz,
      questions
    };
  }

  async canUserTakeQuiz(quizId: string, userId: string): Promise<{ canTake: boolean; attemptsUsed: number; maxAttempts: number }> {
    const quiz = await this.findById(quizId);
    if (!quiz) {
      return { canTake: false, attemptsUsed: 0, maxAttempts: 0 };
    }

    const attempts = await this.getUserQuizAttempts(userId, quizId);
    const attemptsUsed = attempts.length;

    return {
      canTake: attemptsUsed < quiz.attempts,
      attemptsUsed,
      maxAttempts: quiz.attempts
    };
  }

  async getQuizStats(quizId: string): Promise<any> {
    const stats = await this.db.raw(`
      SELECT 
        COUNT(DISTINCT qa.user_id) as total_participants,
        COUNT(qa.id) as total_attempts,
        AVG(qa.score) as average_score,
        COUNT(CASE WHEN qa.passed = true THEN 1 END) as passed_attempts,
        COUNT(CASE WHEN qa.passed = false THEN 1 END) as failed_attempts
      FROM quiz_attempts qa
      WHERE qa.quiz_id = ? AND qa.completed_at IS NOT NULL
    `, [quizId]);

    return stats.rows[0] || {
      total_participants: 0,
      total_attempts: 0,
      average_score: 0,
      passed_attempts: 0,
      failed_attempts: 0
    };
  }
}
