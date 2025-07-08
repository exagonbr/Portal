import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
// import { Lesson } from '../entities/Lesson'; // Supondo que a entidade Lesson exista

// Interface para desacoplar
export interface Lesson {
    id: string;
    module_id: string;
    title: string;
    type: 'video' | 'text' | 'quiz';
    content_id: string; // ID para o vídeo, texto ou quiz
    order: number;
    is_completed: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateLessonData extends Omit<Lesson, 'id' | 'created_at' | 'updated_at' | 'is_completed'> {}
export interface UpdateLessonData extends Partial<CreateLessonData> {}

export class LessonRepository extends ExtendedRepository<Lesson> {
  constructor() {
    super('lessons');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Lesson>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('lesson');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('lesson.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('lesson.id', 'DESC')
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
          SELECT * FROM lesson
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM lesson
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
      console.error(`Erro ao buscar registros de lesson:`, error);
      throw error;
    }
  }

  async findByModule(moduleId: string): Promise<Lesson[]> {
    return this.db(this.tableName)
      .where('module_id', moduleId)
      .orderBy('order', 'asc');
  }

  async findByType(type: 'video' | 'text' | 'quiz'): Promise<Lesson[]> {
    return this.findAll({ type } as Partial<Lesson>);
  }

  async getNextOrder(moduleId: string): Promise<number> {
    const result = await this.db(this.tableName)
      .where('module_id', moduleId)
      .max('order as max_order')
      .first();

    return (result?.max_order || 0) + 1;
  }

  async reorderLessons(moduleId: string, lessonOrders: { id: string; order: number }[]): Promise<void> {
    await this.executeTransaction(async (trx) => {
      for (const lessonOrder of lessonOrders) {
        await trx(this.tableName)
          .where({ id: lessonOrder.id, module_id: moduleId })
          .update({ order: lessonOrder.order });
      }
    });
  }

  // A lógica de progresso do usuário geralmente fica em uma tabela separada (ex: user_lesson_progress)
  async markAsCompleted(userId: string, lessonId: string): Promise<void> {
    // Exemplo:
    // await this.db('user_lesson_progress').insert({ user_id: userId, lesson_id: lessonId, completed: true }).onConflict().merge();
    console.log(`Lição ${lessonId} marcada como completa para o usuário ${userId}`);
  }
}