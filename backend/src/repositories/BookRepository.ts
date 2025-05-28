import { BaseRepository } from './BaseRepository';
import { Book, CreateBookData, UpdateBookData } from '../models/Book';

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super('books');
  }

  async findByCourse(courseId: string): Promise<Book[]> {
    return this.findAll({ course_id: courseId } as Partial<Book>);
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return this.findOne({ isbn } as Partial<Book>);
  }

  async findByAuthor(author: string): Promise<Book[]> {
    return this.db(this.tableName)
      .where('author', 'ilike', `%${author}%`)
      .select('*');
  }

  async createBook(data: CreateBookData): Promise<Book> {
    return this.create(data);
  }

  async updateBook(id: string, data: UpdateBookData): Promise<Book | null> {
    return this.update(id, data);
  }

  async deleteBook(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async searchBooks(searchTerm: string, courseId?: string): Promise<Book[]> {
    let query = this.db(this.tableName)
      .where('title', 'ilike', `%${searchTerm}%`)
      .orWhere('author', 'ilike', `%${searchTerm}%`)
      .orWhere('isbn', 'ilike', `%${searchTerm}%`);

    if (courseId) {
      query = query.andWhere('course_id', courseId);
    }

    return query.select('*');
  }

  async getBookAnnotations(bookId: string, userId?: string): Promise<any[]> {
    let query = this.db('annotations')
      .where('book_id', bookId);

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    return query
      .orderBy('page_number', 'asc')
      .orderBy('created_at', 'asc')
      .select('*');
  }

  async getBookHighlights(bookId: string, userId?: string): Promise<any[]> {
    let query = this.db('highlights')
      .where('book_id', bookId);

    if (userId) {
      query = query.andWhere('user_id', userId);
    }

    return query
      .orderBy('page_number', 'asc')
      .orderBy('created_at', 'asc')
      .select('*');
  }

  async getBooksWithCourse(): Promise<any[]> {
    return this.db(this.tableName)
      .select(
        'books.*',
        'courses.name as course_name'
      )
      .leftJoin('courses', 'books.course_id', 'courses.id');
  }

  async getBookWithCourse(id: string): Promise<any | null> {
    const result = await this.db(this.tableName)
      .select(
        'books.*',
        'courses.name as course_name'
      )
      .leftJoin('courses', 'books.course_id', 'courses.id')
      .where('books.id', id)
      .first();

    return result || null;
  }

  async getBooksByFormat(format: string): Promise<Book[]> {
    return this.findAll({ format } as Partial<Book>);
  }

  async updateBookProgress(bookId: string, userId: string, progress: number): Promise<void> {
    // This would typically be in a separate user_book_progress table
    // For now, we'll just track it in a simple way
    const existingProgress = await this.db('user_progress')
      .where({ user_id: userId, book_id: bookId })
      .first();

    if (existingProgress) {
      await this.db('user_progress')
        .where({ user_id: userId, book_id: bookId })
        .update({
          progress_percentage: progress,
          updated_at: new Date()
        });
    } else {
      await this.db('user_progress').insert({
        user_id: userId,
        book_id: bookId,
        progress_percentage: progress,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  }

  async getUserBookProgress(bookId: string, userId: string): Promise<any | null> {
    return this.db('user_progress')
      .where({ user_id: userId, book_id: bookId })
      .first();
  }
}
