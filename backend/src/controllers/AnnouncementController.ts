import { Request, Response } from 'express';
import { AnnouncementRepository } from '../repositories/AnnouncementRepository';
import { Announcement } from '../entities/Announcement';
import { BaseController } from './BaseController';

class AnnouncementController extends BaseController<Announcement> {
  private announcementRepository: AnnouncementRepository;

  constructor() {
    const repository = new AnnouncementRepository();
    super(repository);
    this.announcementRepository = repository;
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const announcement = await this.announcementRepository.toggleStatus(id);
      if (!announcement) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
      return res.status(200).json({ success: true, data: announcement });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new AnnouncementController();
