import { BaseRepository } from './BaseRepository';
import { Lesson, CreateLessonData, UpdateLessonData } from '../models/Lesson';

export class LessonRepository extends BaseRepository<Lesson> {
  constructor() {
    super('lessons');
  }

  async findByModule(moduleId: string): Promise<Lesson[]> {
    return this.db(this.tableName)
      .where('module_id', moduleId)
      .orderBy('order', 'asc')
      .select('*');
  }

  async findByType(type: string): Promise<Lesson[]> {
    return this.findAll({ type } as Partial<Lesson>);
  }

  async createLesson(data: CreateLessonData): Promise<Lesson> {
    return this.create(data);
  }

  async updateLesson(id: string, data: UpdateLessonData): Promise<Lesson | null> {
    return this.update(id, data);
  }

  async deleteLesson(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async reorderLessons(moduleId: string, lessonOrders: { id: string; order: number }[]): Promise<void> {
    await this.executeTransaction(async (trx) => {
      for (const lessonOrder of lessonOrders) {
        await trx('lessons')
          .where('id', lessonOrder.id)
          .andWhere('module_id', moduleId)
          .update({ order: lessonOrder.order, updated_at: new Date() });
      }
    });
  }

  async getNextOrder(moduleId: string): Promise<number> {
    const result = await this.db(this.tableName)
      .where('module_id', moduleId)
      .max('order as max_order')
      .first();

    return (result?.max_order || 0) + 1;
  }

  async updateCompletion(id: string, isCompleted: boolean): Promise<Lesson | null> {
    return this.update(id, { is_completed: isCompleted } as Partial<Lesson>);
  }

  async updateProgress(userId: string, lessonId: string, progressPercentage: number, completed: boolean = false): Promise<void> {
    const existingProgress = await this.db('user_progress')
      .where({ user_id: userId, lesson_id: lessonId })
      .first();

    if (existingProgress) {
      await this.db('user_progress')
        .where({ user_id: userId, lesson_id: lessonId })
        .update({
          progress_percentage: progressPercentage,
          completed,
          updated_at: new Date()
        });
    } else {
      await this.db('user_progress').insert({
        user_id: userId,
        lesson_id: lessonId,
        progress_percentage: progressPercentage,
        completed,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  async getUserProgress(userId: string, lessonId: string): Promise<any | null> {
    return this.db('user_progress')
      .where({ user_id: userId, lesson_id: lessonId })
      .first();
  }
}
