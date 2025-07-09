import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Question } from '../entities/Question';

export interface CreateQuestionData extends Omit<Question, 'id' | 'created_at' | 'updated_at' | 'quiz'> {}
export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

export class QuestionRepository extends ExtendedRepository<Question> {

  constructor() {
    super("questions");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Question>> {
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
