import { BookRepository } from '../repositories/BookRepository';
import { Book } from '../entities/Book';
import { BaseController } from './BaseController';

const bookRepository = new BookRepository();

class BookController extends BaseController<Book> {
  constructor() {
    const repository = new BookRepository();
    super(repository);
    this.bookRepository = repository;
    super(bookRepository);
  }
}

export default new BookController();