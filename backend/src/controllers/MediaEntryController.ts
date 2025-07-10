import { Request, Response } from 'express';
import { MediaEntryRepository } from '../repositories/MediaEntryRepository';
import BaseController from './BaseController';
import { MediaEntry } from '../entities/MediaEntry';

class MediaEntryController extends BaseController<MediaEntry> {
  private mediaEntryRepository: MediaEntryRepository;

  constructor() {
    const repository = new MediaEntryRepository();
    super(repository);
    this.mediaEntryRepository = repository;
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mediaEntry = await this.mediaEntryRepository.toggleStatus(id);
      if (!mediaEntry) {
        return res.status(404).json({ success: false, message: 'Media Entry not found' });
      }
      return res.status(200).json({ success: true, data: mediaEntry });
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
      
      const mediaEntries = await this.mediaEntryRepository.search(q as string);
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in search media entries: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getActive(req: Request, res: Response) {
    try {
      const mediaEntries = await this.mediaEntryRepository.findActive();
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getActive: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getFeatured(req: Request, res: Response) {
    try {
      const mediaEntries = await this.mediaEntryRepository.findFeatured();
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getFeatured: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getPopular(req: Request, res: Response) {
    try {
      const mediaEntries = await this.mediaEntryRepository.findPopular();
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getPopular: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getNew(req: Request, res: Response) {
    try {
      const mediaEntries = await this.mediaEntryRepository.findNew();
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getNew: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getRecommended(req: Request, res: Response) {
    try {
      const mediaEntries = await this.mediaEntryRepository.findRecommended();
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getRecommended: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getByAuthor(req: Request, res: Response) {
    try {
      const { authorId } = req.params;
      const mediaEntries = await this.mediaEntryRepository.findByAuthor(parseInt(authorId));
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getByAuthor: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getByPublisher(req: Request, res: Response) {
    try {
      const { publisherId } = req.params;
      const mediaEntries = await this.mediaEntryRepository.findByPublisher(parseInt(publisherId));
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getByPublisher: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getByGenre(req: Request, res: Response) {
    try {
      const { genreId } = req.params;
      const mediaEntries = await this.mediaEntryRepository.findByGenre(parseInt(genreId));
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getByGenre: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async getBySubject(req: Request, res: Response) {
    try {
      const { subjectId } = req.params;
      const mediaEntries = await this.mediaEntryRepository.findBySubject(parseInt(subjectId));
      return res.status(200).json({ success: true, data: mediaEntries });
    } catch (error) {
      console.error(`Error in getBySubject: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async incrementViews(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.mediaEntryRepository.incrementViews(id);
      return res.status(200).json({ success: true, message: 'Views incremented successfully' });
    } catch (error) {
      console.error(`Error in incrementViews: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.mediaEntryRepository.softDelete(id);
      
      if (!success) {
        return res.status(404).json({ success: false, message: 'Media Entry not found' });
      }
      
      return res.status(200).json({ success: true, message: 'Media Entry deleted successfully' });
    } catch (error) {
      console.error(`Error in softDelete: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new MediaEntryController();
