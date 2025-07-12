import { Request, Response } from 'express';
import { PublicRepository } from '../repositories/PublicRepository';
import { BaseController } from './BaseController';
import { Public } from '../entities/Public';

class PublicController extends BaseController<Public> {
  private publicRepository: PublicRepository;

  constructor() {
    const repository = new PublicRepository();
    super(repository);
    this.publicRepository = repository;
  }

  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
      }
      
      const publics = await this.publicRepository.findByName(q as string);
      return res.status(200).json({ success: true, data: publics });
    } catch (error) {
      console.error(`Error in search publics: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async findByApiId(req: Request, res: Response) {
    try {
      const { apiId } = req.params;
      const publicItem = await this.publicRepository.findByApiId(parseInt(apiId));
      
      if (!publicItem) {
        return res.status(404).json({ success: false, message: 'Public not found' });
      }
      
      return res.status(200).json({ success: true, data: publicItem });
    } catch (error) {
      console.error(`Error in findByApiId: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new PublicController();
