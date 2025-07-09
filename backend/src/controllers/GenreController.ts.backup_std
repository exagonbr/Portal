import { Request, Response } from 'express';
import { GenreRepository } from '../repositories/GenreRepository';
import { BaseController } from './BaseController';
import { Genre } from '../entities/Genre';

class GenreController extends BaseController<Genre> {
  private genreRepository: GenreRepository;

  constructor() {
    const repository = new GenreRepository();
    super(repository);
    this.genreRepository = repository;
  }

  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
      }
      
      const genres = await this.genreRepository.findByName(q as string);
      return res.status(200).json({ success: true, data: genres });
    } catch (error) {
      console.error(`Error in search genres: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async findByApiId(req: Request, res: Response) {
    try {
      const { apiId } = req.params;
      const genre = await this.genreRepository.findByApiId(parseInt(apiId));
      
      if (!genre) {
        return res.status(404).json({ success: false, message: 'Genre not found' });
      }
      
      return res.status(200).json({ success: true, data: genre });
    } catch (error) {
      console.error(`Error in findByApiId: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new GenreController();
