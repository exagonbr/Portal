import { BaseRepository } from './BaseRepository';
import { Book } from '../entities/Book';

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super('books');
  }
}