import { BaseRepository } from './BaseRepository';
import { Book } from '../entities/Book';
// Supondo que as entidades Annotation e Highlight existam em algum lugar
// import { Annotation } from '../entities/Annotation'; 
// import { Highlight } from '../entities/Highlight';

export interface CreateBookData extends Omit<Book, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateBookData extends Partial<CreateBookData> {}

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super('books');
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

  async findByTitle(title: string): Promise<Book[]> {
    return this.db(this.tableName).where('title', 'ilike', `%${title}%`);
  }

  async findByAuthor(author: string): Promise<Book[]> {
    return this.db(this.tableName).where('author', 'ilike', `%${author}%`);
  }
  
  async findByPublisher(publisher: string): Promise<Book[]> {
    return this.db(this.tableName).where('publisher', 'ilike', `%${publisher}%`);
  }

  async findByEducationLevel(level: string): Promise<Book[]> {
    return this.findAll({ education_level: level } as Partial<Book>);
  }

  async search(term: string): Promise<Book[]> {
    return this.db(this.tableName)
      .where('title', 'ilike', `%${term}%`)
      .orWhere('author', 'ilike', `%${term}%`)
      .orWhere('publisher', 'ilike', `%${term}%`)
      .orWhere('synopsis', 'ilike', `%${term}%`);
  }

  // Exemplo de como seria a busca por anotações (requer entidade Annotation)
  /*
  async getAnnotations(bookId: string, userId?: string): Promise<Annotation[]> {
    let query = this.db('annotations').where('book_id', bookId);
    if (userId) {
      query = query.andWhere('user_id', userId);
    }
    return query.orderBy('created_at', 'asc');
  }
  */

  // Exemplo de como seria a busca por destaques (requer entidade Highlight)
  /*
  async getHighlights(bookId: string, userId?: string): Promise<Highlight[]> {
    let query = this.db('highlights').where('book_id', bookId);
    if (userId) {
      query = query.andWhere('user_id', userId);
    }
    return query.orderBy('created_at', 'asc');
  }
  */
}