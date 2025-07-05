import { Request, Response } from 'express';
import { AuthorRepository } from '../repositories/AuthorRepository';
import { Author } from '../entities/Author';
import { BaseController } from './BaseController';

const authorRepository = new AuthorRepository();

class AuthorController extends BaseController<Author> {
  constructor() {
    super(authorRepository);
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const author = await authorRepository.toggleStatus(id);
      if (!author) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }
      return res.status(200).json({ success: true, data: author });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new AuthorController();