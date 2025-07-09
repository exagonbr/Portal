import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
// Comentando a importação da entidade Question para evitar erros
// import { Question } from '../entities/Question';

// Interface para desacoplar
export interface Question {
    id: string;
    quiz_id: number;
    text: string;
    type: string;
    options: any[]; // Opções da questão
    correct_answer: any; // Resposta correta
    created_at: Date;
    updated_at: Date;
}

export interface CreateQuestionData extends Omit<Question, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateQuestionData extends Partial<CreateQuestionData> {}

export class QuestionRepository extends ExtendedRepository<Question> {
  // Removendo a propriedade repository já que não estamos usando TypeORM diretamente

  constructor() {
    super("questions");
    // Estamos usando Knex através da classe base, não TypeORM
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
    } catch (error) {
      throw error;
    }
  }

  async createQuestion(data: CreateQuestionData): Promise<Question> {
    try {
      return this.create(data);
    } catch (error) {
      throw error;
    }
  }

  async updateQuestion(id: string, data: UpdateQuestionData): Promise<Question | null> {
    try {
      return this.update(id, data);
    } catch (error) {
      throw error;
    }
  }

  async deleteQuestion(id: string): Promise<boolean> {
    try {
      return this.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async findByQuiz(quizId: string): Promise<Question[]> {
    try {
      return this.findAll({ quiz_id: parseInt(quizId) } as Partial<Question>);
    } catch (error) {
      throw error;
    }
  }

  async findByType(type: string): Promise<Question[]> {
    try {
      return this.findAll({ type } as Partial<Question>);
    } catch (error) {
      throw error;
    }
  }
}
