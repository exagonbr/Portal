import { BookRepository } from '../repositories/BookRepository';
import { Book } from '../entities/Book';
import { BaseController } from './BaseController';

const bookRepository = new BookRepository();

class BookController extends BaseController<Book> {
  constructor() {
    super(bookRepository);
  }
}

export default new BookController();