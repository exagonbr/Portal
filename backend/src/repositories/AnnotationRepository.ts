import { BaseRepository } from './BaseRepository';
import { Annotation, CreateAnnotationData, UpdateAnnotationData, Highlight, CreateHighlightData, UpdateHighlightData } from '../models/Annotation';

export class AnnotationRepository extends BaseRepository<Annotation> {
  constructor() {
    super('annotations');
  }

  async findByBook(bookId: string, userId?: string): Promise<Annotation[]> {
    let query = this.db(this.tableName).where('book_id', bookId);

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    return query
      .orderBy('page_number', 'asc')
      .orderBy('created_at', 'asc')
      .select('*');
  }

  async findByUser(userId: string): Promise<Annotation[]> {
    return this.findAll({ user_id: userId } as Partial<Annotation>);
  }

  async findByPage(bookId: string, pageNumber: number, userId?: string): Promise<Annotation[]> {
    let query = this.db(this.tableName)
      .where({ book_id: bookId, page_number: pageNumber });

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    return query
      .orderBy('created_at', 'asc')
      .select('*');
  }

  async createAnnotation(data: CreateAnnotationData): Promise<Annotation> {
    return this.create(data);
  }

  async updateAnnotation(id: string, data: UpdateAnnotationData): Promise<Annotation | null> {
    return this.update(id, data);
  }

  async deleteAnnotation(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getAnnotationsWithBook(userId: string): Promise<any[]> {
    return this.db(this.tableName)
      .select(
        'annotations.*',
        'books.title as book_title',
        'books.author as book_author'
      )
      .leftJoin('books', 'annotations.book_id', 'books.id')
      .where('annotations.user_id', userId)
      .orderBy('annotations.created_at', 'desc');
  }

  async searchAnnotations(userId: string, searchTerm: string): Promise<Annotation[]> {
    return this.db(this.tableName)
      .where('user_id', userId)
      .andWhere('content', 'ilike', `%${searchTerm}%`)
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getAnnotationsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Annotation[]> {
    return this.db(this.tableName)
      .where('user_id', userId)
      .andWhere('created_at', '>=', startDate)
      .andWhere('created_at', '<=', endDate)
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getAnnotationCount(bookId: string, userId?: string): Promise<number> {
    let query = this.db(this.tableName).where('book_id', bookId);

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    const result = await query.count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }
}

export class HighlightRepository extends BaseRepository<Highlight> {
  constructor() {
    super('highlights');
  }

  async findByBook(bookId: string, userId?: string): Promise<Highlight[]> {
    let query = this.db(this.tableName).where('book_id', bookId);

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    return query
      .orderBy('page_number', 'asc')
      .orderBy('created_at', 'asc')
      .select('*');
  }

  async findByUser(userId: string): Promise<Highlight[]> {
    return this.findAll({ user_id: userId } as Partial<Highlight>);
  }

  async findByPage(bookId: string, pageNumber: number, userId?: string): Promise<Highlight[]> {
    let query = this.db(this.tableName)
      .where({ book_id: bookId, page_number: pageNumber });

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    return query
      .orderBy('created_at', 'asc')
      .select('*');
  }

  async findByColor(color: string, userId?: string): Promise<Highlight[]> {
    let query = this.db(this.tableName).where('color', color);

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    return query
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async createHighlight(data: CreateHighlightData): Promise<Highlight> {
    return this.create(data);
  }

  async updateHighlight(id: string, data: UpdateHighlightData): Promise<Highlight | null> {
    return this.update(id, data);
  }

  async deleteHighlight(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async getHighlightsWithBook(userId: string): Promise<any[]> {
    return this.db(this.tableName)
      .select(
        'highlights.*',
        'books.title as book_title',
        'books.author as book_author'
      )
      .leftJoin('books', 'highlights.book_id', 'books.id')
      .where('highlights.user_id', userId)
      .orderBy('highlights.created_at', 'desc');
  }

  async searchHighlights(userId: string, searchTerm: string): Promise<Highlight[]> {
    return this.db(this.tableName)
      .where('user_id', userId)
      .andWhere('content', 'ilike', `%${searchTerm}%`)
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getHighlightsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Highlight[]> {
    return this.db(this.tableName)
      .where('user_id', userId)
      .andWhere('created_at', '>=', startDate)
      .andWhere('created_at', '<=', endDate)
      .orderBy('created_at', 'desc')
      .select('*');
  }

  async getHighlightCount(bookId: string, userId?: string): Promise<number> {
    let query = this.db(this.tableName).where('book_id', bookId);

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    const result = await query.count('* as count').first();
    return parseInt(result?.count as string) || 0;
  }

  async getColorStats(userId: string): Promise<any[]> {
    return this.db(this.tableName)
      .select('color')
      .count('* as count')
      .where('user_id', userId)
      .groupBy('color')
      .orderBy('count', 'desc');
  }
}
