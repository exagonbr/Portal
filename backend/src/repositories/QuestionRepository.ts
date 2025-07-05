import { BaseRepository } from './BaseRepository';
import { Question } from '../entities/Question';

export interface CreateQuestionData extends Omit<Question, 'id' | 'created_at' | 'updated_at' | 'quiz'> {}
export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

export class QuestionRepository extends BaseRepository<Question> {
  constructor() {
    super('questions');
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