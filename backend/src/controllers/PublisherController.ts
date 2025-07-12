import { Request, Response } from 'express';
import { PublisherRepository } from '../repositories/PublisherRepository';
import BaseController from './BaseController';
import { Publisher } from '../entities/Publisher';

class PublisherController extends BaseController<Publisher> {
  private publisherRepository: PublisherRepository;

  constructor() {
    const repository = new PublisherRepository();
    super(repository);
    this.publisherRepository = repository;
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const publisher = await this.publisherRepository.toggleStatus(id);
      if (!publisher) {
        return res.status(404).json({ success: false, message: 'Publisher not found' });
      }
      return res.status(200).json({ success: true, data: publisher });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
      }
      
      const publishers = await this.publisherRepository.findByName(q as string);
      return res.status(200).json({ success: true, data: publishers });
    } catch (error) {
      console.error(`Error in search publishers: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const publishers = await this.publisherRepository.findActive();
      return res.status(200).json({ success: true, data: publishers });
    } catch (error) {
      console.error(`Error in getActive: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new PublisherController();
