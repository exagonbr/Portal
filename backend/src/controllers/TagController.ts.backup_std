import { Request, Response } from 'express';
import { TagRepository } from '../repositories/TagRepository';
import { BaseController } from './BaseController';
import { Tag } from '../entities/Tag';

class TagController extends BaseController<Tag> {
  private tagRepository: TagRepository;

  constructor() {
    const repository = new TagRepository();
    super(repository);
    this.tagRepository = repository;
  }

  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query parameter "q" is required' });
      }
      
      const tags = await this.tagRepository.findByName(q as string);
      return res.status(200).json({ success: true, data: tags });
    } catch (error) {
      console.error(`Error in search tags: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const tags = await this.tagRepository.findActive();
      return res.status(200).json({ success: true, data: tags });
    } catch (error) {
      console.error(`Error in getActive: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async findByExactName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const tag = await this.tagRepository.findByExactName(name);
      
      if (!tag) {
        return res.status(404).json({ success: false, message: 'Tag not found' });
      }
      
      return res.status(200).json({ success: true, data: tag });
    } catch (error) {
      console.error(`Error in findByExactName: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.tagRepository.softDelete(id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Tag not found' });
      }
      
      return res.status(200).json({ success: true, message: 'Tag deleted successfully' });
    } catch (error) {
      console.error(`Error in softDelete: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new TagController();
