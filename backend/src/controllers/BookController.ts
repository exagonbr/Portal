import { BookRepository, Book } from '../repositories/BookRepository';
import { BaseController } from './BaseController';

const bookRepository = new BookRepository();

class BookController extends BaseController<Book> {
  constructor() {
    super(bookRepository);
  }
}

export default new BookController();